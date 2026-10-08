import cn from "classnames";
import styles from "./style.module.scss";

export type ListOption = {
  value: string;
  label: string;
  hint?: string | null;
};

type OptionListProps = {
  id: string;
  options: ListOption[];
  selected: string | null;
  active: number;
  onChoose: (option: ListOption) => void;
  emptyText?: string;
};

/** Выпадающий список вариантов под полем. Фокус остаётся в поле, выбор — по клику или Enter. */
const OptionList = ({
  id,
  options,
  selected,
  active,
  onChoose,
  emptyText = "Ничего не нашлось",
}: OptionListProps) => (
  <ul className={styles.list} id={id} role="listbox">
    {options.length === 0 && <li className={styles.empty}>{emptyText}</li>}

    {options.map((option, index) => (
      <li
        key={option.value}
        id={`${id}-${index}`}
        className={cn(
          styles.option,
          option.value === selected && styles.selected,
          index === active && styles.active,
        )}
        role="option"
        aria-selected={option.value === selected}
        onMouseDown={(event) => {
          event.preventDefault();
          onChoose(option);
        }}
      >
        {option.label}
        {option.hint && <span className={styles.hint}>{option.hint}</span>}
      </li>
    ))}
  </ul>
);

export default OptionList;
