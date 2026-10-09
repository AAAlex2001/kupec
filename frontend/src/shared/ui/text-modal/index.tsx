"use client";

import { useId, useState } from "react";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Modal from "@/shared/ui/modal";
import Textarea from "@/shared/ui/textarea";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type TextModalProps = {
  open: boolean;
  title: string;
  label: string;
  initial?: string;
  submitLabel: string;
  pending: boolean;
  danger?: boolean;
  onSubmit: (text: string) => void;
  onClose: () => void;
};

/** Окно с одним многострочным полем: причина отклонения, новый текст и т.п. */
const TextModal = ({
  open,
  title,
  label,
  initial = "",
  submitLabel,
  pending,
  danger,
  onSubmit,
  onClose,
}: TextModalProps) => {
  const id = useId();
  const [text, setText] = useState(initial);

  return (
    <Modal open={open} onClose={onClose} ariaLabel={title}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(text.trim());
        }}
      >
        <Title>{title}</Title>

        <Field label={label} htmlFor={id}>
          <Textarea id={id} value={text} onChange={setText} maxLength={2000} />
        </Field>

        <div className={styles.buttons}>
          <Button
            className={styles.button}
            type="submit"
            variant={danger ? "danger" : "primary"}
            loading={pending}
            disabled={!text.trim()}
          >
            {submitLabel}
          </Button>
          <Button className={styles.button} variant="ghost" disabled={pending} onClick={onClose}>
            Отменить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TextModal;
