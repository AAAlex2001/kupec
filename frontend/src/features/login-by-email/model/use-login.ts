"use client";

import { useReducer } from "react";
import { loginWithCode, requestLoginCode, type User } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";
import { LOGIN_START, loginReducer } from "./reducer";
import { CODE_LENGTH, EMAIL_ERROR, isEmail } from "./validate";

/** Вход по почте: отправить код, ввести его и получить пользователя. */
export const useLogin = (onSuccess: (user: User) => void) => {
  const [state, dispatch] = useReducer(loginReducer, LOGIN_START);
  const email = state.email.trim();

  const changeEmail = (value: string) => dispatch({ type: "email/change", email: value });
  const editEmail = () => dispatch({ type: "email/edit" });

  const sendCode = async () => {
    if (!isEmail(email)) {
      dispatch({ type: "request/failure", error: EMAIL_ERROR });

      return;
    }

    dispatch({ type: "send/start" });

    try {
      const sent = await requestLoginCode(email);
      dispatch({ type: "send/success", resendAfter: sent.resend_after });
    } catch (failure) {
      dispatch({ type: "request/failure", error: errorMessage(failure, "Не удалось отправить код") });
    }
  };

  const verify = async (code: string) => {
    dispatch({ type: "verify/start" });

    try {
      onSuccess(await loginWithCode(email, code));
    } catch (failure) {
      dispatch({ type: "request/failure", error: errorMessage(failure, "Не удалось войти") });
    }
  };

  const changeCode = (code: string) => {
    dispatch({ type: "code/change", code });
    if (code.length === CODE_LENGTH) verify(code);
  };

  return { state, changeEmail, editEmail, sendCode, changeCode, verify };
};
