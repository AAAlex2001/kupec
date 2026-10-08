"use client";

import cn from "classnames";
import { useState, type KeyboardEvent } from "react";
import { ChevronDownIcon } from "@/shared/ui/icons";
import OptionList, { type ListOption } from "@/shared/ui/option-list";
import styles from "./style.module.scss";

type DropdownProps = {
  id: string;
  value: string;
  options: ListOption[];
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  className?: string;
};

/** Выбор одного варианта из списка: поле со стрелкой и стилизованный список под ним. */
const Dropdown = ({
  id,
  value,
  options,
  onChange,
  placeholder,
  invalid,
  className,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${id}-list`;
  const selected = options.find((option) => option.value === value);

  const show = () => {
    setActive(options.findIndex((option) => option.value === value));
    setOpen(true);
  };

  const choose = (option: ListOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const move = (step: number) =>
    setActive((index) => Math.min(options.length - 1, Math.max(0, index + step)));

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }

      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if ((event.key === "Enter" || event.key === " ") && options[active]) {
      event.preventDefault();
      choose(options[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={cn(styles.dropdown, open && styles.open, className)}>
      <button
        id={id}
        type="button"
        className={cn(styles.field, invalid && styles.invalid)}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={handleKey}
        onBlur={() => setOpen(false)}
      >
        <span className={cn(styles.value, !selected && styles.placeholder)}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open && (
        <OptionList
          id={listId}
          options={options}
          selected={value}
          active={active}
          onChoose={choose}
          emptyText="Нет вариантов"
        />
      )}
    </div>
  );
};

export default Dropdown;
