"use client";

import cn from "classnames";
import { useRef } from "react";
import styles from "./style.module.scss";

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  length: number;
  invalid?: boolean;
  disabled?: boolean;
};

/** Код из письма по клетке на цифру: фокус сам идёт дальше, вставка заполняет все клетки. */
const CodeInput = ({ value, onChange, length, invalid, disabled }: CodeInputProps) => {
  const cells = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = (index: number) => cells.current[Math.min(index, length - 1)]?.focus();

  const type = (index: number, text: string) => {
    const digits = text.replace(/\D/g, "");
    if (!digits) return;

    const next = (value.slice(0, index) + digits).slice(0, length);
    onChange(next);
    focusCell(next.length);
  };

  const erase = (index: number) => {
    const from = value[index] ? index : Math.max(0, index - 1);
    onChange(value.slice(0, from));
    focusCell(from);
  };

  return (
    <div className={styles.code} role="group" aria-label="Код из письма">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(cell) => {
            cells.current[index] = cell;
          }}
          className={cn(styles.cell, invalid && styles.invalid)}
          value={value[index] ?? ""}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={index === 0}
          aria-label={`Цифра ${index + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onFocus={() => index > value.length && focusCell(value.length)}
          onChange={(event) => type(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.preventDefault();
              erase(index);
            }
          }}
        />
      ))}
    </div>
  );
};

export default CodeInput;
