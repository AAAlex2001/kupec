"use client";

import { TelegramGuideButton, useTelegramLink } from "@/entities/telegram";
import Checkbox from "@/shared/ui/checkbox";
import styles from "./style.module.scss";

type TelegramToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Флажок «Опубликовать также в Telegram-канал». Канал не подключён — кнопка с инструкцией. */
const TelegramToggle = ({ checked, onChange }: TelegramToggleProps) => {
  const { link } = useTelegramLink();

  if (!link?.enabled) return null;

  if (!link.channel_title) {
    return (
      <div className={styles.guide}>
        <TelegramGuideButton link={link} label="Подключить Telegram-канал" />
      </div>
    );
  }

  return (
    <Checkbox checked={checked} onChange={onChange}>
      Опубликовать также в Telegram-канал «{link.channel_title}»
    </Checkbox>
  );
};

export default TelegramToggle;
