"use client";

import { useState } from "react";
import { login, type User } from "@/entities/user";
import { EMAIL_ERROR, isEmail } from "@/shared/lib/email";
import { errorMessage } from "@/shared/lib/errors";

/** Вход по почте и паролю. */
export const useLoginForm = (onSuccess: (user: User) => void) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!isEmail(email)) return setError(EMAIL_ERROR);
    if (!password) return setError("Введите пароль");

    setPending(true);
    setError(null);

    try {
      onSuccess(await login(email.trim(), password));
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось войти"));
      setPending(false);
    }
  };

  return { email, setEmail, password, setPassword, pending, error, submit };
};
