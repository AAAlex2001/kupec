"use client";

import { useRef, type FormEvent } from "react";
import Button from "@/shared/ui/button";
import { ImageIcon, SendIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import { MAX_SUPPORT_PHOTOS, useComposer } from "../../model/use-composer";
import ComposerPhoto from "../composer-photo";
import styles from "./style.module.scss";

type SupportComposerProps = {
  placeholder: string;
  onSend: (text: string, files: File[]) => Promise<void>;
};

/** Поле сообщения в поддержку: текст, до 5 фото и отправка. Enter тоже отправляет. */
const SupportComposer = ({ placeholder, onSend }: SupportComposerProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const composer = useComposer(onSend);
  const canAttach = composer.files.length < MAX_SUPPORT_PHOTOS;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    composer.send();
  };

  return (
    <form className={styles.composer} onSubmit={submit}>
      {composer.files.length > 0 && (
        <div className={styles.photos}>
          {composer.files.map((file, index) => (
            <ComposerPhoto key={`${file.name}-${file.lastModified}-${index}`} file={file} onRemove={() => composer.removeFile(index)} />
          ))}
        </div>
      )}

      <div className={styles.row}>
        <Button
          className={styles.attach}
          variant="tool"
          size="icon"
          ariaLabel="Прикрепить фото"
          disabled={!canAttach}
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon />
        </Button>

        <Input
          className={styles.input}
          value={composer.text}
          onChange={composer.setText}
          placeholder={placeholder}
          ariaLabel="Текст сообщения"
          maxLength={2000}
          autoComplete="off"
        />

        <Button type="submit" size="lg" loading={composer.pending} disabled={composer.empty} ariaLabel="Отправить">
          {!composer.pending && <SendIcon />}
        </Button>
      </div>

      <input
        ref={fileRef}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        onChange={(event) => {
          composer.addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {composer.error && <p className={styles.error}>{composer.error}</p>}
    </form>
  );
};

export default SupportComposer;
