"use client";

import { EmailField, PasswordField, type User } from "@/entities/user";
import { PASSWORD_ERROR } from "@/shared/lib/email";
import Button from "@/shared/ui/button";
import CodeStep from "@/shared/ui/code-step";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useRegister } from "../../model/use-register";
import styles from "./style.module.scss";

type RegisterFormProps = {
  onSuccess: (user: User) => void;
};

/** Регистрация: почта и пароль, затем подтверждение почты кодом из письма. */
const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const form = useRegister(onSuccess);

  if (form.step === "code") {
    return (
      <CodeStep
        title="Подтвердите почту"
        email={form.email}
        code={form.code}
        error={form.error}
        pending={form.pending}
        submitLabel="Подтвердить"
        resendAfter={form.resendAfter}
        sentCount={form.sentCount}
        onChange={form.changeCode}
        onSubmit={form.confirm}
        onResend={form.send}
        onEditEmail={form.editEmail}
      />
    );
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.send();
      }}
    >
      <Title>Регистрация</Title>

      <EmailField value={form.email} onChange={form.setEmail} autoFocus />
      <PasswordField
        value={form.password}
        onChange={form.setPassword}
        hint={PASSWORD_ERROR}
        isNew
      />

      {form.error && <Notice tone="error">{form.error}</Notice>}

      <Button type="submit" loading={form.pending}>
        Зарегистрироваться
      </Button>
      <p className={styles.hint}>Отправим на почту код, чтобы подтвердить её.</p>
    </form>
  );
};

export default RegisterForm;
