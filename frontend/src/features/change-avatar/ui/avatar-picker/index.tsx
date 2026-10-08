"use client";

import { useRef } from "react";
import { avatarLetter, type User } from "@/entities/user";
import Avatar from "@/shared/ui/avatar";
import Button from "@/shared/ui/button";
import { useAvatarUpload } from "../../model/use-avatar-upload";
import styles from "./style.module.scss";

type AvatarPickerProps = {
  user: User;
};

/** Фото профиля и кнопка «Изменить фото»: файл загружается сразу после выбора. */
const AvatarPicker = ({ user }: AvatarPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { pending, error, upload } = useAvatarUpload();

  return (
    <div className={styles.picker}>
      <div className={styles.row}>
        <Avatar src={user.avatar_url} letter={avatarLetter(user)} size="lg" />

        <Button variant="secondary" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? "Загружаем…" : "Изменить фото"}
        </Button>

        <input
          ref={inputRef}
          className={styles.file}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default AvatarPicker;
