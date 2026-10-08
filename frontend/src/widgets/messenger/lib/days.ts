import type { Message } from "@/entities/conversation";

/** Начинается ли с сообщения новый день: тогда над ним нужен разделитель с датой. */
export const startsNewDay = (messages: Message[], index: number) => {
  if (index === 0) return true;

  const current = new Date(messages[index].created_at).toDateString();
  const previous = new Date(messages[index - 1].created_at).toDateString();

  return current !== previous;
};
