"use client";

import { TelegramGuideButton, useTelegramLink } from "@/entities/telegram";
import Checkbox from "@/shared/ui/checkbox";
import styles from "./style.module.scss";

type TelegramToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Блок «Telegram» в форме поста: флажок отправки в канал, а без канала — кнопка с инструкцией. */
const TelegramToggle = ({ checked, onChange }: TelegramToggleProps) => {
  const { link } = useTelegramLink();

  if (!link?.enabled) return null;

  return (
    <section className={styles.section}>
      <p className={styles.title}>Telegram</p>

      {link.channel_title && (
        <Checkbox checked={checked} onChange={onChange}>
          Опубликовать также в Telegram-канал «{link.channel_title}»
        </Checkbox>
      )}
      {!link.channel_title && <TelegramGuideButton link={link} label="Подключить Telegram-канал" />}
    </section>
  );
};

export default TelegramToggle;
