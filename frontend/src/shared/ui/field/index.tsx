import cn from "classnames";
import type { ReactNode } from "react";
import styles from "./style.module.scss";

type FieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
};

/** Подпись над полем формы, красная ошибка и серая подсказка под ним. */
const Field = ({ label, htmlFor, children, hint, error, className }: FieldProps) => (
  <div className={cn(styles.field, className)}>
    <label className={styles.label} htmlFor={htmlFor}>
      {label}
    </label>

    {children}

    {error && <p className={styles.error}>{error}</p>}
    {hint && <div className={styles.hint}>{hint}</div>}
  </div>
);

export default Field;
