import { decimalInput } from "@/shared/lib/decimal-input";
import Input from "@/shared/ui/input";
import styles from "./style.module.scss";

type RangeInputProps = {
  id: string;
  from: string;
  to: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  onChange: (from: string, to: string) => void;
};

/** Два поля «от» и «до» для числа: цены, веса, года. */
const RangeInput = ({ id, from, to, fromPlaceholder, toPlaceholder, onChange }: RangeInputProps) => (
  <div className={styles.range}>
    <Input
      id={id}
      value={from}
      inputMode="decimal"
      placeholder={fromPlaceholder}
      ariaLabel="от"
      maxLength={12}
      onChange={(value) => onChange(decimalInput(value), to)}
    />
    <Input
      value={to}
      inputMode="decimal"
      placeholder={toPlaceholder}
      ariaLabel="до"
      maxLength={12}
      onChange={(value) => onChange(from, decimalInput(value))}
    />
  </div>
);

export default RangeInput;
