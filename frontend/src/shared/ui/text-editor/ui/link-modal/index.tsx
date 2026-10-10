"use client";

import { useId, useState } from "react";
import { withProtocol } from "@/shared/lib/url";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type LinkModalProps = {
  open: boolean;
  onSave: (href: string) => void;
  onClose: () => void;
};

/** Окно с адресом ссылки. Без протокола адрес дополняется https://.
 *
 * Без своей формы: редактор стоит внутри формы поста, а форма в форме ломает страницу.
 */
const LinkModal = ({ open, onSave, onClose }: LinkModalProps) => {
  const id = useId();
  const [url, setUrl] = useState("");
  const empty = url.trim() === "";

  const save = () => {
    if (empty) return;

    onSave(withProtocol(url.trim()));
    setUrl("");
  };

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Ссылка">
      <div className={styles.form}>
        <Title>Ссылка</Title>

        <Field label="Адрес" htmlFor={id}>
          <Input
            id={id}
            value={url}
            onChange={setUrl}
            placeholder="https://"
            autoFocus
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              save();
            }}
          />
        </Field>

        <div className={styles.buttons}>
          <Button className={styles.button} disabled={empty} onClick={save}>
            Добавить
          </Button>
          <Button className={styles.button} variant="ghost" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkModal;
