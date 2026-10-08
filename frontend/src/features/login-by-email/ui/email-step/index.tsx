"use client";

import { useId } from "react";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type EmailStepProps = {
  email: string;
  error: string | null;
  sending: boolean;
  onChange: (email: string) => void;
  onSubmit: () => void;
};

/** Шаг «Вход и регистрация»: почта и кнопка «Получить код на почту». */
const EmailStep = ({ email, error, sending, onChange, onSubmit }: EmailStepProps) => {
  const id = useId();

  return (
    <form
      className={styles.step}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Title>Вход и регистрация</Title>

      <Field label="Электронная почта" htmlFor={id} error={error}>
        <Input
          id={id}
          type="email"
          value={email}
          onChange={onChange}
          placeholder="anna@example.com"
          invalid={Boolean(error)}
          autoFocus
          maxLength={254}
          inputMode="email"
          autoComplete="email"
        />
      </Field>

      <div className={styles.footer}>
        <Button className={styles.submit} type="submit" loading={sending}>
          {sending ? "Отправляем код…" : "Получить код на почту"}
        </Button>

        <p className={styles.hint}>Аккаунт создастся автоматически, если вы здесь впервые.</p>
      </div>
    </form>
  );
};

export default EmailStep;
