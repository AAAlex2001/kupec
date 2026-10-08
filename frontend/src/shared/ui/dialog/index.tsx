"use client";

import cn from "classnames";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./style.module.scss";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  className: string;
  children: ReactNode;
};

/** Нативный dialog: закрывается Escape и кликом по фону. Вид задаёт className. */
const Dialog = ({ open, onClose, ariaLabel, className, children }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(styles.dialog, className)}
      aria-label={ariaLabel}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
};

export default Dialog;
