"use client";

import Button from "@/shared/ui/button";
import CodeInput from "@/shared/ui/code-input";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import type { LoginState } from "../../model/types";
import { CODE_LENGTH } from "../../model/validate";
import ResendButton from "../resend-button";
import styles from "./style.module.scss";

type CodeStepProps = {
  state: LoginState;
  onChange: (code: string) => void;
  onVerify: (code: string) => void;
  onResend: () => void;
  onEditEmail: () => void;
};

/** Шаг «Код на почте»: клетки под цифры, подтверждение, повторная отправка и смена почты. */
const CodeStep = ({ state, onChange, onVerify, onResend, onEditEmail }: CodeStepProps) => {
  const verifying = state.pending === "verify";

  return (
    <form
      className={styles.step}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onVerify(state.code);
      }}
    >
      <Title>Код на почте</Title>

      <p className={styles.text}>Отправили код на {state.email.trim()}</p>

      <CodeInput
        value={state.code}
        onChange={onChange}
        length={CODE_LENGTH}
        invalid={Boolean(state.error)}
        disabled={verifying}
      />

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <div className={styles.actions}>
        <Button type="submit" loading={verifying} disabled={state.code.length !== CODE_LENGTH}>
          {verifying ? "Проверяем код…" : "Подтвердить"}
        </Button>

        {verifying && <p className={styles.hint}>Подождите, подтверждаем вашу почту.</p>}

        <ResendButton
          key={state.sentCount}
          seconds={state.resendAfter}
          disabled={state.pending !== null}
          onClick={onResend}
        />

        <Button variant="ghost" disabled={verifying} onClick={onEditEmail}>
          Изменить почту
        </Button>
      </div>
    </form>
  );
};

export default CodeStep;
