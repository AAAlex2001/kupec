"use client";

import { useState } from "react";
import { confirmEmail, register, type User } from "@/entities/user";
import { EMAIL_ERROR, PASSWORD_ERROR, PASSWORD_MIN_LENGTH, isEmail } from "@/shared/lib/email";
import { errorMessage } from "@/shared/lib/errors";
import { CODE_LENGTH } from "@/shared/ui/code-step";

/** Регистрация: почта и пароль, затем код из письма. Полный код подтверждается сразу. */
export const useRegister = (onSuccess: (user: User) => void) => {
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAfter, setResendAfter] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const send = async () => {
    if (!isEmail(email)) return setError(EMAIL_ERROR);
    if (password.length < PASSWORD_MIN_LENGTH) return setError(PASSWORD_ERROR);

    setPending(true);
    setError(null);

    try {
      const sent = await register(email.trim(), password);
      setResendAfter(sent.resend_after);
      setSentCount((count) => count + 1);
      setCode("");
      setStep("code");
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось зарегистрироваться"));
    }

    setPending(false);
  };

  const confirm = async (value: string) => {
    setPending(true);
    setError(null);

    try {
      onSuccess(await confirmEmail(email.trim(), value));
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось подтвердить почту"));
      setPending(false);
    }
  };

  const changeCode = (value: string) => {
    setCode(value);
    setError(null);
    if (value.length === CODE_LENGTH) confirm(value);
  };

  const editEmail = () => {
    setStep("form");
    setError(null);
  };

  return {
    step,
    email,
    setEmail,
    password,
    setPassword,
    code,
    pending,
    error,
    resendAfter,
    sentCount,
    send,
    changeCode,
    confirm: () => confirm(code),
    editEmail,
  };
};
