"use client";

import { useReducer } from "react";
import { confirmEmailChange, requestEmailChange, useUser } from "@/entities/user";
import { errorMessage } from "@/shared/lib/errors";
import { EMAIL_IDLE, emailReducer } from "./reducer";

/** Смена почты в два шага: новый адрес, затем код из письма на него. */
export const useEmailChange = () => {
  const { setUser } = useUser();
  const [state, dispatch] = useReducer(emailReducer, EMAIL_IDLE);

  const open = () => dispatch({ type: "edit/open" });
  const close = () => dispatch({ type: "edit/close" });
  const changeEmail = (email: string) => dispatch({ type: "email/change", email });
  const changeCode = (code: string) => dispatch({ type: "code/change", code });

  const sendCode = async () => {
    dispatch({ type: "request/start" });

    try {
      await requestEmailChange(state.email.trim());
      dispatch({ type: "request/sent" });
    } catch (failure) {
      dispatch({ type: "request/failure", error: errorMessage(failure, "Не удалось отправить код") });
    }
  };

  const confirm = async () => {
    dispatch({ type: "request/start" });

    try {
      setUser(await confirmEmailChange(state.code.trim()));
      dispatch({ type: "edit/close" });
    } catch (failure) {
      dispatch({ type: "request/failure", error: errorMessage(failure, "Не удалось сменить почту") });
    }
  };

  return { state, open, close, changeEmail, changeCode, sendCode, confirm };
};
