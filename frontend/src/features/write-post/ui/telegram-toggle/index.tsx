"use client";

import { useTelegramLink } from "@/entities/telegram";
import Checkbox from "@/shared/ui/checkbox";

type TelegramToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Флажок «Опубликовать также в Telegram-канал». Без подключённого канала не показывается. */
const TelegramToggle = ({ checked, onChange }: TelegramToggleProps) => {
  const { link } = useTelegramLink();

  if (!link?.channel_title) return null;

  return (
    <Checkbox checked={checked} onChange={onChange}>
      Опубликовать также в Telegram-канал «{link.channel_title}»
    </Checkbox>
  );
};

export default TelegramToggle;
