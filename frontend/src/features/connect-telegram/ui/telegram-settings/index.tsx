"use client";

import { useTelegramLink } from "@/entities/telegram";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import { telegramStatus } from "../../lib/status";
import { useDisconnectTelegram } from "../../model/use-disconnect-telegram";
import styles from "./style.module.scss";

/** Блок «Telegram-канал» в настройках: подключить бота, увидеть канал, отключить. Без бота на сервере не показывается. */
const TelegramSettings = () => {
  const { link, reload } = useTelegramLink();
  const { pending, error, disconnect } = useDisconnectTelegram(reload);

  if (!link?.enabled) return null;

  const connect = () => window.open(link.connect_url ?? "", "_blank", "noopener");

  return (
    <section className={styles.section}>
      <p className={styles.title}>Telegram-канал</p>
      <p className={styles.text}>{telegramStatus(link)}</p>

      {!link.linked && <Button onClick={connect}>Подключить Telegram</Button>}
      {link.linked && (
        <Button variant="secondary" loading={pending} onClick={disconnect}>
          Отключить
        </Button>
      )}

      {error && <Notice tone="error">{error}</Notice>}
    </section>
  );
};

export default TelegramSettings;
