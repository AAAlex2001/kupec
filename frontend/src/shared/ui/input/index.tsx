import cn from "classnames";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./style.module.scss";

type InputProps = {
  id?: string;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel";
  autoComplete?: string;
  role?: "combobox";
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  className?: string;
};

/** Поле ввода высотой 44px. invalid красит рамку, слева иконка, справа suffix. */
const Input = ({
  id,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  readOnly,
  disabled,
  invalid,
  autoFocus,
  maxLength,
  inputMode,
  autoComplete,
  role,
  ariaExpanded,
  ariaControls,
  ariaLabel,
  icon,
  suffix,
  className,
}: InputProps) => (
  <div
    className={cn(styles.field, readOnly && styles.readOnly, invalid && styles.invalid, className)}
  >
    {icon}

    <input
      id={id}
      className={styles.input}
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      autoFocus={autoFocus}
      maxLength={maxLength}
      inputMode={inputMode}
      autoComplete={autoComplete}
      role={role}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      onChange={onChange && ((event) => onChange(event.target.value))}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />

    {suffix}
  </div>
);

export default Input;
