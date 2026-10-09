"use client";

import type { ReactNode } from "react";
import Button from "@/shared/ui/button";
import CodeInput from "@/shared/ui/code-input";
import Notice from "@/shared/ui/notice";
import ResendButton from "@/shared/ui/resend-button";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

export const CODE_LENGTH = 6;

type CodeStepProps = {
  title: string;
  email: string;
  code: string;
  error: string | null;
  pending: boolean;
  submitLabel: string;
  resendAfter: number;
  sentCount: number;
  onChange: (code: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onEditEmail: () => void;
  children?: ReactNode;
};

/** Шаг «Код на почте»: клетки под цифры, кнопка подтверждения, повторная отправка и смена почты. */
const CodeStep = ({
  title,
  email,
  code,
  error,
  pending,
  submitLabel,
  resendAfter,
  sentCount,
  onChange,
  onSubmit,
  onResend,
  onEditEmail,
  children,
}: CodeStepProps) => (
  <form
    className={styles.step}
    noValidate
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <Title>{title}</Title>

    <p className={styles.text}>Отправили код на {email.trim()}</p>

    <CodeInput
      value={code}
      onChange={onChange}
      length={CODE_LENGTH}
      invalid={Boolean(error)}
      disabled={pending}
    />

    {children}

    {error && <Notice tone="error">{error}</Notice>}

    <div className={styles.actions}>
      <Button type="submit" loading={pending} disabled={code.length !== CODE_LENGTH}>
        {submitLabel}
      </Button>

      <ResendButton key={sentCount} seconds={resendAfter} disabled={pending} onClick={onResend} />

      <Button variant="ghost" disabled={pending} onClick={onEditEmail}>
        Изменить почту
      </Button>
    </div>
  </form>
);

export default CodeStep;
