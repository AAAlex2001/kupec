"use client";

import { useId } from "react";
import type { CommentTarget } from "@/entities/comment";
import { useUser } from "@/entities/user";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Textarea from "@/shared/ui/textarea";
import { useCommentForm } from "../../model/use-comment-form";
import CommentGuest from "../comment-guest";
import styles from "./style.module.scss";

const MAX_LENGTH = 2000;

type CommentFormProps = {
  target: CommentTarget;
  onSent: () => void;
};

/** Новый комментарий к посту или статье: поле и «Отправить комментарий». Гостю — предложение войти. */
const CommentForm = ({ target, onSent }: CommentFormProps) => {
  const { user } = useUser();
  const id = useId();
  const form = useCommentForm(target, null, onSent);

  if (!user) return <CommentGuest />;

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        form.send();
      }}
    >
      <Field label="Новый комментарий" htmlFor={id} error={form.error}>
        <Textarea
          id={id}
          value={form.text}
          onChange={form.setText}
          placeholder="Напишите комментарий…"
          maxLength={MAX_LENGTH}
        />
      </Field>

      <Button type="submit" className={styles.send} loading={form.pending} disabled={form.empty}>
        Отправить комментарий
      </Button>
    </form>
  );
};

export default CommentForm;
