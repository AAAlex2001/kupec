"use client";

import { useState } from "react";
import type { AttributeOptionPayload } from "@/entities/attribute";
import Button from "@/shared/ui/button";
import { CloseIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import styles from "./style.module.scss";

type OptionsEditorProps = {
  options: AttributeOptionPayload[];
  onAdd: (label: string) => void;
  onRename: (index: number, label: string) => void;
  onRemove: (index: number) => void;
};

/** Варианты списка: подписи можно править, новые — добавлять, лишние — убирать. */
const OptionsEditor = ({ options, onAdd, onRename, onRemove }: OptionsEditorProps) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  };

  return (
    <div className={styles.editor}>
      <p className={styles.label}>Варианты</p>

      {options.map((option, index) => (
        <div key={option.id ?? `new-${option.value}-${index}`} className={styles.row}>
          <Input
            className={styles.input}
            value={option.label}
            ariaLabel={`Вариант ${index + 1}`}
            maxLength={100}
            onChange={(label) => onRename(index, label)}
          />
          <Button
            variant="danger"
            size="icon"
            ariaLabel={`Убрать вариант «${option.label}»`}
            onClick={() => onRemove(index)}
          >
            <CloseIcon />
          </Button>
        </div>
      ))}

      <div className={styles.row}>
        <Input
          className={styles.input}
          value={draft}
          placeholder="Новый вариант"
          ariaLabel="Новый вариант"
          maxLength={100}
          onChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button variant="secondary" disabled={!draft.trim()} onClick={add}>
          Добавить
        </Button>
      </div>
    </div>
  );
};

export default OptionsEditor;
