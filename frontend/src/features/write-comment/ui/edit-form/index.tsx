"use client";

import { useId } from "react";
import type { Comment } from "@/entities/comment";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Textarea from "@/shared/ui/textarea";
import { useEditComment } from "../../model/use-edit-comment";
import styles from "./style.module.scss";

const MAX_LENGTH = 2000;

type EditFormProps = {
  comment: Comment;
  onSaved: () => void;
  onCancel: () => void;
};

/** Правка своего комментария на месте текста: поле, «Сохранить» и «Отмена». */
const EditForm = ({ comment, onSaved, onCancel }: EditFormProps) => {
  const id = useId();
  const form = useEditComment(comment, onSaved);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        form.save();
      }}
    >
      <Field label="Ваш комментарий" htmlFor={id} error={form.error}>
        <Textarea id={id} value={form.text} onChange={form.setText} maxLength={MAX_LENGTH} />
      </Field>

      <div className={styles.buttons}>
        <Button type="submit" loading={form.pending} disabled={form.empty}>
          Сохранить
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default EditForm;
