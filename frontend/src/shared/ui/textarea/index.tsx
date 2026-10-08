import cn from "classnames";
import styles from "./style.module.scss";

type TextareaProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
};

/** Многострочное поле, высота растягивается вручную по вертикали. */
const Textarea = ({
  id,
  value,
  onChange,
  placeholder,
  invalid,
  maxLength,
  rows = 4,
  className,
}: TextareaProps) => (
  <textarea
    id={id}
    className={cn(styles.textarea, invalid && styles.invalid, className)}
    value={value}
    placeholder={placeholder}
    maxLength={maxLength}
    rows={rows}
    aria-invalid={invalid || undefined}
    onChange={(event) => onChange(event.target.value)}
  />
);

export default Textarea;
