"use client";

import cn from "classnames";
import type { ReactNode } from "react";
import CloseButton from "@/shared/ui/close-button";
import Dialog from "@/shared/ui/dialog";
import styles from "./style.module.scss";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  wide?: boolean;
};

/** Окно по центру экрана: обычное или широкое. Высокое прокручивается, клик мимо окна закрывает его. */
const Modal = ({ open, onClose, ariaLabel, children, wide }: ModalProps) => (
  <Dialog open={open} onClose={onClose} ariaLabel={ariaLabel} className={styles.modal}>
    <div
      className={styles.frame}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={cn(styles.panel, wide && styles.wide)}>
        {children}
        <CloseButton className={styles.close} onClick={onClose} />
      </div>
    </div>
  </Dialog>
);

export default Modal;
