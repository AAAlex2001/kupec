"use client";

import { EmailField, PasswordField, type User } from "@/entities/user";
import { PASSWORD_ERROR } from "@/shared/lib/email";
import Button from "@/shared/ui/button";
import CodeStep from "@/shared/ui/code-step";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useResetPassword } from "../../model/use-reset-password";
import styles from "./style.module.scss";

type ResetPasswordFormProps = {
  onSuccess: (user: User) => void;
};

/** Восстановление пароля: почта, затем код из письма и новый пароль. */
const ResetPasswordForm = ({ onSuccess }: ResetPasswordFormProps) => {
  const form = useResetPassword(onSuccess);

  if (form.step === "code") {
    return (
      <CodeStep
        title="Новый пароль"
        email={form.email}
        code={form.code}
        error={form.error}
        pending={form.pending}
        submitLabel="Сохранить пароль"
        resendAfter={form.resendAfter}
        sentCount={form.sentCount}
        onChange={form.changeCode}
        onSubmit={form.save}
        onResend={form.send}
        onEditEmail={form.editEmail}
      >
        <PasswordField
          label="Новый пароль"
          value={form.password}
          onChange={form.setPassword}
          hint={PASSWORD_ERROR}
          isNew
        />
      </CodeStep>
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
      <Title>Восстановление пароля</Title>
      <p className={styles.text}>Пришлём на почту код, по нему вы зададите новый пароль.</p>

      <EmailField value={form.email} onChange={form.setEmail} autoFocus />

      {form.error && <Notice tone="error">{form.error}</Notice>}

      <Button type="submit" loading={form.pending}>
        Получить код
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
