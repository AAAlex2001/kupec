"use client";

import { useId } from "react";
import type { User } from "@/entities/user";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import { useEmailChange } from "../../model/use-email-change";
import styles from "./style.module.scss";

type EmailFieldProps = {
  user: User;
};

/** Почта профиля. Новый адрес подтверждается кодом из письма, вход остаётся по почте. */
const EmailField = ({ user }: EmailFieldProps) => {
  const id = useId();
  const { state, open, close, changeEmail, changeCode, sendCode, confirm } = useEmailChange();

  if (state.step === "idle") {
    return (
      <Field
        label="Электронная почта"
        htmlFor={id}
        hint={
          <>
            <span className={styles.status}>
              <span className={styles.accent}>Почта подтверждена</span>
              <button type="button" className={styles.link} onClick={open}>
                Изменить почту
              </button>
            </span>
            При смене адреса отправим код на новую почту. Вход остаётся по электронной почте.
          </>
        }
      >
        <Input id={id} type="email" value={user.email} readOnly />
      </Field>
    );
  }

  const isCodeStep = state.step === "code";

  return (
    <Field
      label={isCodeStep ? "Код из письма" : "Новая электронная почта"}
      htmlFor={id}
      error={state.error}
      hint={
        isCodeStep && (
          <>
            Отправили код на {state.email}. Он действует 10 минут.{" "}
            <strong>Не пришёл? Проверьте папку «Спам».</strong>
          </>
        )
      }
    >
      <div className={styles.edit}>
        {isCodeStep ? (
          <Input
            id={id}
            className={styles.input}
            value={state.code}
            onChange={(code) => changeCode(code.replace(/\D/g, ""))}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        ) : (
          <Input
            id={id}
            className={styles.input}
            type="email"
            value={state.email}
            onChange={changeEmail}
            placeholder="new@example.com"
            maxLength={254}
            autoComplete="email"
          />
        )}

        <Button
          variant="secondary"
          disabled={state.pending || (isCodeStep ? state.code.length !== 6 : !state.email.trim())}
          onClick={isCodeStep ? confirm : sendCode}
        >
          {isCodeStep ? "Подтвердить" : "Отправить код"}
        </Button>

        <Button variant="ghost" disabled={state.pending} onClick={close}>
          Отменить
        </Button>
      </div>
    </Field>
  );
};

export default EmailField;
