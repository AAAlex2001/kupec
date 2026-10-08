"use client";

import type { ReactNode } from "react";
import CloseButton from "@/shared/ui/close-button";
import Dialog from "@/shared/ui/dialog";
import styles from "./style.module.scss";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
};

/** Окно по центру экрана. Крестик идёт после содержимого, чтобы фокус при открытии попал в форму. */
const Modal = ({ open, onClose, ariaLabel, children }: ModalProps) => (
  <Dialog open={open} onClose={onClose} ariaLabel={ariaLabel} className={styles.modal}>
    {children}
    <CloseButton className={styles.close} onClick={onClose} />
  </Dialog>
);

export default Modal;
