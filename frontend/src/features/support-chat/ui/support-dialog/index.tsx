"use client";

import { SupportFrame, SupportMessages } from "@/entities/support";
import { useUser } from "@/entities/user";
import Button from "@/shared/ui/button";
import CloseButton from "@/shared/ui/close-button";
import Dialog from "@/shared/ui/dialog";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import { useSupportChat } from "../../model/use-support-chat";
import SupportIntro from "../support-intro";
import styles from "./style.module.scss";

type SupportDialogProps = {
  onClose: () => void;
};

/** Чат с поддержкой на весь экран: шапка, переписка и поле сообщения с фото. Гостю — подсказка войти. */
const SupportDialog = ({ onClose }: SupportDialogProps) => {
  const { user, openAuth } = useUser();
  const chat = useSupportChat();

  return (
    <Dialog open onClose={onClose} ariaLabel="Чат с поддержкой" className={styles.dialog}>
      <div className={styles.layout} data-lightbox-root>
        <SupportFrame
          title="Поддержка"
          subtitle="Отвечаем здесь же, обычно в течение 30 минут"
          action={<CloseButton onClick={onClose} />}
          placeholder="Опишите вопрос…"
          onSend={chat.send}
        >
          {!user && (
            <Notice tone="info" action={<Button onClick={openAuth}>Войти</Button>}>
              Вы пишете как гость: ответ появится в этом чате, в этом же браузере.
            </Notice>
          )}
          {chat.error && <Notice tone="error">{chat.error}</Notice>}
          {!chat.messages && !chat.error && <Loader />}
          {chat.messages && (
            <SupportMessages messages={chat.messages} side="visitor" visitorName="Вы" intro={<SupportIntro />} />
          )}
        </SupportFrame>
      </div>
    </Dialog>
  );
};

export default SupportDialog;
