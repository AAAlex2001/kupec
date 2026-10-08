import type { ReactNode } from "react";
import { CheckIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
};

/** Флажок 20×20 с подписью справа. */
const Checkbox = ({ checked, onChange, children }: CheckboxProps) => (
  <label className={styles.checkbox}>
    <input
      className={styles.input}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />

    <span className={styles.box} aria-hidden="true">
      <CheckIcon className={styles.check} />
    </span>

    <span className={styles.label}>{children}</span>
  </label>
);

export default Checkbox;
