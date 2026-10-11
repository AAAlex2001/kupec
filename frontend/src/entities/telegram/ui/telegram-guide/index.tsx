"use client";

import Button from "@/shared/ui/button";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import { telegramGuideSteps } from "../../lib/guide";
import type { TelegramLink } from "../../model/types";
import styles from "./style.module.scss";

type TelegramGuideProps = {
  link: TelegramLink;
  onClose: () => void;
};

/** Окно с пошаговой инструкцией подключения канала. «Открыть бота» — пока аккаунт не привязан. */
const TelegramGuide = ({ link, onClose }: TelegramGuideProps) => {
  const steps = telegramGuideSteps(link.bot_username ?? "");
  const openBot = () => window.open(link.connect_url ?? "", "_blank", "noopener");

  return (
    <Modal open onClose={onClose} ariaLabel="Как подключить Telegram-канал">
      <div className={styles.content}>
        <Title className={styles.title}>Как подключить Telegram-канал</Title>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className={styles.note}>
          Если бот уже был в канале, удалите его из администраторов и добавьте снова. Приватные каналы тоже подходят.
        </p>

        {!link.linked && (
          <Button className={styles.open} onClick={openBot}>
            Открыть бота
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default TelegramGuide;
