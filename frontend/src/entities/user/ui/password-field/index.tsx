"use client";

import { useId } from "react";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";

type PasswordFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  isNew?: boolean;
};

/** Поле пароля. isNew — для регистрации и нового пароля, чтобы браузер предложил надёжный. */
const PasswordField = ({ label = "Пароль", value, onChange, hint, isNew }: PasswordFieldProps) => {
  const id = useId();

  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        maxLength={128}
        autoComplete={isNew ? "new-password" : "current-password"}
      />
    </Field>
  );
};

export default PasswordField;
