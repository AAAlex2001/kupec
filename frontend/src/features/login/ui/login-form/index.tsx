"use client";

import { EmailField, PasswordField, type User } from "@/entities/user";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useLoginForm } from "../../model/use-login-form";
import styles from "./style.module.scss";

type LoginFormProps = {
  onSuccess: (user: User) => void;
  onForgot: () => void;
};

/** Форма «Вход»: почта, пароль и «Забыли пароль?». */
const LoginForm = ({ onSuccess, onForgot }: LoginFormProps) => {
  const form = useLoginForm(onSuccess);

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <Title>Вход</Title>

      <EmailField value={form.email} onChange={form.setEmail} autoFocus />
      <PasswordField value={form.password} onChange={form.setPassword} />

      {form.error && <Notice tone="error">{form.error}</Notice>}

      <Button type="submit" loading={form.pending}>
        Войти
      </Button>
      <Button variant="ghost" onClick={onForgot}>
        Забыли пароль?
      </Button>
    </form>
  );
};

export default LoginForm;
