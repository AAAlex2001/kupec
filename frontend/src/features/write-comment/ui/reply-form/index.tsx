"use client";

import { useId } from "react";
import type { Comment, CommentTarget } from "@/entities/comment";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Textarea from "@/shared/ui/textarea";
import { useCommentForm } from "../../model/use-comment-form";
import styles from "./style.module.scss";

const MAX_LENGTH = 2000;

type ReplyFormProps = {
  target: CommentTarget;
  replyTo: Comment;
  onSent: () => void;
  onCancel: () => void;
};

/** Ответ на комментарий: кому, цитата, поле «Ваш ответ», «Отправить ответ» и «Отмена». */
const ReplyForm = ({ target, replyTo, onSent, onCancel }: ReplyFormProps) => {
  const id = useId();
  const form = useCommentForm(target, replyTo.id, onSent);

  return (
    <form
      className={styles.reply}
      onSubmit={(event) => {
        event.preventDefault();
        form.send();
      }}
    >
      <p className={styles.to}>Ответ {replyTo.author.name ?? "пользователю"}</p>
      <p className={styles.quote}>«{replyTo.text}»</p>

      <Field label="Ваш ответ" htmlFor={id} error={form.error}>
        <Textarea id={id} value={form.text} onChange={form.setText} maxLength={MAX_LENGTH} />
      </Field>

      <div className={styles.buttons}>
        <Button type="submit" loading={form.pending} disabled={form.empty}>
          Отправить ответ
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
