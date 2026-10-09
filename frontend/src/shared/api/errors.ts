type ValidationItem = {
  msg?: string;
};

/** Текст ошибки из ответа бэкенда: строка detail или сообщения валидации. */
export const readErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `Ошибка ${response.status}`;

  if (!response.headers.get("content-type")?.includes("application/json")) return fallback;

  const body = await response.json();

  if (typeof body.detail === "string") return body.detail;

  if (Array.isArray(body.detail)) {
    const messages = body.detail
      .map((item: ValidationItem) => item.msg ?? "")
      .filter((message: string) => message !== "");

    if (messages.length > 0) return messages.join(". ");
  }

  return fallback;
};
