"""Запросы к языковой модели через ProxyAPI в формате OpenAI Chat Completions."""

import httpx

from app.core.config import Settings

TIMEOUT_SECONDS = 90


class AiError(Exception):
    """Модель не ответила: нет ключа, сеть, лимиты или пустой ответ."""


class AiClient:
    """Клиент модели с настройками из .env."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def complete(self, system: str, user: str, max_tokens: int) -> str:
        """Ответ модели на системную инструкцию и сообщение пользователя. Ошибки — AiError."""

        if not self.settings.proxyapi_key:
            raise AiError("Не задан PROXYAPI_KEY")

        body = {
            "model": self.settings.ai_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        headers = {"Authorization": f"Bearer {self.settings.proxyapi_key}"}

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                response = await client.post(
                    f"{self.settings.ai_base_url}/chat/completions", json=body, headers=headers
                )
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise AiError(str(error)) from error

        choices = data.get("choices") or []
        content = choices[0].get("message", {}).get("content") if choices else None
        if not content:
            raise AiError("Пустой ответ модели")

        return content
