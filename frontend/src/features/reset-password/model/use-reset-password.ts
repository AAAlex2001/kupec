"use client";

import { useState } from "react";
import { requestPasswordReset, resetPassword, type User } from "@/entities/user";
import { EMAIL_ERROR, PASSWORD_ERROR, PASSWORD_MIN_LENGTH, isEmail } from "@/shared/lib/email";
import { errorMessage } from "@/shared/lib/errors";

/** Восстановление пароля: код на почту, затем код и новый пароль. */
export const useResetPassword = (onSuccess: (user: User) => void) => {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAfter, setResendAfter] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const send = async () => {
    if (!isEmail(email)) return setError(EMAIL_ERROR);

    setPending(true);
    setError(null);

    try {
      const sent = await requestPasswordReset(email.trim());
      setResendAfter(sent.resend_after);
      setSentCount((count) => count + 1);
      setCode("");
      setStep("code");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось отправить код"));
    }

    setPending(false);
  };

  const save = async () => {
    if (password.length < PASSWORD_MIN_LENGTH) return setError(PASSWORD_ERROR);

    setPending(true);
    setError(null);

    try {
      onSuccess(await resetPassword(email.trim(), code, password));
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить пароль"));
      setPending(false);
    }
  };

  const changeCode = (value: string) => {
    setCode(value);
    setError(null);
  };

  const editEmail = () => {
    setStep("email");
    setError(null);
  };

  return {
    step,
    email,
    setEmail,
    code,
    changeCode,
    password,
    setPassword,
    pending,
    error,
    resendAfter,
    sentCount,
    send,
    save,
    editEmail,
  };
};
