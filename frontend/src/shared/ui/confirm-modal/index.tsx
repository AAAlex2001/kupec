"use client";

import Button from "@/shared/ui/button";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Окно подтверждения необратимого действия, например удаления. */
const ConfirmModal = ({
  open,
  title,
  text,
  confirmLabel,
  pending,
  onConfirm,
  onClose,
}: ConfirmModalProps) => (
  <Modal open={open} onClose={onClose} ariaLabel={title}>
    <div className={styles.confirm}>
      <Title>{title}</Title>
      <p className={styles.text}>{text}</p>

      <div className={styles.buttons}>
        <Button className={styles.action} variant="danger" loading={pending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button className={styles.action} variant="ghost" disabled={pending} onClick={onClose}>
          Отменить
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;
