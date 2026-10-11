import type { TelegramLink } from "@/entities/telegram";

/** Подсказка в настройках: что сделать дальше или куда уходят посты. */
export const telegramStatus = (link: TelegramLink) => {
  if (!link.linked) {
    return "Публикуйте посты сразу на сайте и в своём Telegram-канале. Нажмите «Подключить Telegram» и «Старт» в боте.";
  }

  if (!link.channel_title) {
    return `Telegram подключён. Добавьте @${link.bot_username} администратором в свой канал с правом публиковать сообщения.`;
  }

  return `Посты можно публиковать в канал «${link.channel_title}».`;
};
