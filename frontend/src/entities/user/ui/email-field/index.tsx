"use client";

import { useId } from "react";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";

type EmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

/** Поле «Электронная почта». */
const EmailField = ({ value, onChange, autoFocus }: EmailFieldProps) => {
  const id = useId();

  return (
    <Field label="Электронная почта" htmlFor={id}>
      <Input
        id={id}
        type="email"
        value={value}
        onChange={onChange}
        placeholder="anna@example.com"
        autoFocus={autoFocus}
        maxLength={254}
        inputMode="email"
        autoComplete="email"
      />
    </Field>
  );
};

export default EmailField;
