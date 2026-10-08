import cn from "classnames";
import styles from "./style.module.scss";

type ChipOption = {
  value: string;
  label: string;
};

type ChipsProps = {
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
};

/** Выбор одного варианта кнопками-чипсами: «Товар» или «Услуга». */
const Chips = ({ value, options, onChange, ariaLabel }: ChipsProps) => (
  <div className={styles.chips} role="radiogroup" aria-label={ariaLabel}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={option.value === value}
        className={cn(styles.chip, option.value === value && styles.active)}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default Chips;
