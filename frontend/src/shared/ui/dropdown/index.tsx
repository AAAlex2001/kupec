"use client";

import cn from "classnames";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  searchable?: boolean;
  searchPlaceholder?: string;
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
  searchable = false,
  searchPlaceholder = "Найти вариант",
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const listId = `${id}-list`;
  const selected = options.find((option) => option.value === value);
  const normalize = (text: string) => text.trim().toLocaleLowerCase("ru").replace(/ё/g, "е");
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const shown = searchable && words.length > 0
    ? options.filter((option) => {
        const text = normalize(`${option.label} ${option.hint ?? ""}`);
        return words.every((word) => text.includes(word));
      })
    : options;

  useEffect(() => {
    if (open && active >= 0) {
      document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active, listId, query]);

  const show = () => {
    setQuery("");
    setActive(options.findIndex((option) => option.value === value));
    setOpen(true);
  };

  const choose = (option: ListOption) => {
    onChange(option.value);
    setOpen(false);
    button.current?.focus();
  };

  const move = (step: number) =>
    setActive((index) => Math.min(shown.length - 1, Math.max(0, index + step)));

  const handleKey = (event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
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
    } else if (event.key === "Enter" || (event.key === " " && event.currentTarget.tagName === "BUTTON")) {
      event.preventDefault();
      if (shown[active]) choose(shown[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      button.current?.focus();
    }
  };

  return (
    <div
      className={cn(styles.dropdown, open && styles.open, className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        id={id}
        ref={button}
        type="button"
        className={cn(styles.field, invalid && styles.invalid)}
        role={searchable ? undefined : "combobox"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={handleKey}
      >
        <span className={cn(styles.value, !selected && styles.placeholder)}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.menu}>
          {searchable && (
            <input
              className={styles.search}
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={active >= 0 && shown[active] ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              autoFocus
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={handleKey}
            />
          )}
          <OptionList
            id={listId}
            options={shown}
            selected={value}
            active={active}
            onChoose={choose}
            emptyText={query ? "Ничего не найдено" : "Нет вариантов"}
          />
        </div>
      )}
    </div>
  );
};

export default Dropdown;
