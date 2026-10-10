"""Сценарий ИИ-помощника: написать публикацию с нуля или переделать текущий текст."""

import re
from datetime import datetime, timedelta, timezone
from html import escape

from app.core.ai import AiClient
from app.core.config import Settings
from app.posts.services.ai_repo import AiRequestRepository
from app.posts.services.exceptions import EmptyAiAnswerError, TooManyAiRequestsError
from app.posts.services.validators import clean_html, has_text
from app.users.models import User

HOUR = timedelta(hours=1)
MAX_TOKENS = 3000
FENCE = re.compile(r"^```[a-z]*\s*|\s*```$")

SYSTEM_PROMPT = """Ты — редактор публикаций на «Купце», площадке частных объявлений по всей России.
Публикации пишут частные продавцы, мастера и фермеры: о своих товарах, услугах, работе и жизни.

Как писать:
- по-русски, если автор не просит другой язык;
- живо, понятно и по делу, без канцелярита, воды и рекламных штампов;
- не выдумывай факты о товаре, ценах, адресах и контактах — бери их только из просьбы и текста автора;
- длина — до 3000 символов, если автор не просит иначе.

Формат ответа — только готовый текст публикации в HTML:
- разрешены только теги <p>, <br>, <strong>, <em>, <u>, <blockquote> и <a href="https://…">;
- каждый абзац — в своём <p>;
- без заголовков h1–h6, списков, таблиц, markdown и блоков кода: вместо заголовка — абзац с <strong>, вместо списка — короткие абзацы, можно с эмодзи;
- без пояснений, вступлений и комментариев к своей работе — только сам текст.

Если текущий текст публикации пустой — напиши публикацию с нуля по просьбе автора.
Если текст есть — измени его так, как просит автор, и верни целиком."""


def to_html(answer: str) -> str:
    """Ответ модели в HTML: без обёртки ```html, а простой текст — по абзацам."""

    text = FENCE.sub("", answer.strip())
    if "<" in text:
        return text

    paragraphs = [part.strip() for part in text.split("\n\n") if part.strip()]

    return "".join(f"<p>{escape(part).replace(chr(10), '<br>')}</p>" for part in paragraphs)


class WritePostWithAiUseCase:
    """Текст публикации от ИИ по просьбе автора. Не чаще лимита запросов в час."""

    def __init__(self, ai: AiClient, requests: AiRequestRepository, settings: Settings) -> None:
        self.ai = ai
        self.requests = requests
        self.settings = settings

    async def execute(self, user: User, instruction: str, html: str) -> str:
        """HTML для редактора. Бросает TooManyAiRequestsError, AiError и EmptyAiAnswerError."""

        now = datetime.now(timezone.utc)
        issued = await self.requests.list_since(user.id, now - HOUR)
        if len(issued) >= self.settings.ai_requests_per_hour:
            wait = int((issued[0] + HOUR - now).total_seconds()) + 1
            raise TooManyAiRequestsError(max(wait, 1))

        await self.requests.add(user.id)

        answer = await self.ai.complete(SYSTEM_PROMPT, self.message(instruction, html), MAX_TOKENS)
        result = clean_html(to_html(answer))
        if not has_text(result):
            raise EmptyAiAnswerError()

        return result

    def message(self, instruction: str, html: str) -> str:
        """Сообщение модели: просьба автора и текущий текст публикации."""

        current = html if has_text(html) else "(пусто)"

        return f"Просьба автора:\n{instruction.strip()}\n\nТекущий текст публикации (HTML):\n{current}"
