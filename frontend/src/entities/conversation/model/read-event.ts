const READ_EVENT = "conversation-read";

/** Сообщить, что переписка прочитана: счётчики непрочитанных обновятся сразу. */
export const notifyRead = () => window.dispatchEvent(new Event(READ_EVENT));

/** Подписаться на прочтение переписки. Возвращает отписку. */
export const onRead = (listener: () => void) => {
  window.addEventListener(READ_EVENT, listener);

  return () => window.removeEventListener(READ_EVENT, listener);
};
