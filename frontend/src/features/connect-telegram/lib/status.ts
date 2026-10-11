import type { TelegramLink } from "@/entities/telegram";

/** Подсказка в настройках: что сделать дальше или куда уходят посты. */
export const telegramStatus = (link: TelegramLink) => {
  if (!link.linked) {
    return "Публикуйте посты сразу на сайте и в своём канале или группе Telegram. Нажмите «Подключить Telegram» и «Старт» в боте.";
  }

  if (!link.channel_title) {
    return `Telegram подключён. Добавьте @${link.bot_username} администратором в свой канал или группу. В канале включите право публиковать сообщения.`;
  }

  return `Посты можно публиковать в Telegram: «${link.channel_title}».`;
};
