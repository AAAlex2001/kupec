"use client";

import type { User } from "@/entities/user";
import { useLogin } from "../../model/use-login";
import CodeStep from "../code-step";
import EmailStep from "../email-step";

type LoginFormProps = {
  onSuccess: (user: User) => void;
};

/** Вход по почте: сначала адрес, затем код из письма. */
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { state, changeEmail, editEmail, sendCode, changeCode, verify } = useLogin(onSuccess);

  if (state.step === "email") {
    return (
      <EmailStep
        email={state.email}
        error={state.error}
        sending={state.pending === "send"}
        onChange={changeEmail}
        onSubmit={sendCode}
      />
    );
  }

  return (
    <CodeStep
      state={state}
      onChange={changeCode}
      onVerify={verify}
      onResend={sendCode}
      onEditEmail={editEmail}
    />
  );
};

export default LoginForm;
