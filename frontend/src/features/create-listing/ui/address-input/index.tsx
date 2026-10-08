"use client";

import { useState, type KeyboardEvent } from "react";
import type { City } from "@/entities/city";
import Input from "@/shared/ui/input";
import OptionList from "@/shared/ui/option-list";
import type { AddressSuggestion } from "@/shared/ui/yandex-map";
import { useAddressSuggest } from "../../model/use-address-suggest";
import styles from "./style.module.scss";

type AddressInputProps = {
  id: string;
  value: string;
  city: City | null;
  onChange: (value: string) => void;
  onChoose: (suggestion: AddressSuggestion) => void;
};

/** Поле адреса с подсказками Яндекса: стрелки выбирают, Enter подтверждает. */
const AddressInput = ({ id, value, city, onChange, onChoose }: AddressInputProps) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const suggestions = useAddressSuggest(open, value, city);
  const listId = `${id}-list`;

  const choose = (suggestion: AddressSuggestion) => {
    setOpen(false);
    onChoose(suggestion);
  };

  const move = (step: number) =>
    setActive((index) => Math.min(suggestions.length - 1, Math.max(0, index + step)));

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") move(1);
    if (event.key === "ArrowUp") move(-1);
    if (event.key === "Escape") setOpen(false);
    if (event.key === "Enter" && suggestions[active]) choose(suggestions[active]);
    if (event.key.startsWith("Arrow") || event.key === "Enter") event.preventDefault();
  };

  return (
    <div className={styles.address}>
      <Input
        id={id}
        role="combobox"
        ariaExpanded={open && suggestions.length > 0}
        ariaControls={listId}
        autoComplete="off"
        placeholder="Начните вводить улицу и дом"
        maxLength={300}
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(text) => {
          onChange(text);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={handleKey}
      />

      {open && suggestions.length > 0 && (
        <OptionList
          id={listId}
          options={suggestions.map((suggestion, index) => ({
            value: String(index),
            label: suggestion.title,
            hint: suggestion.subtitle,
          }))}
          selected={null}
          active={active}
          onChoose={(option) => choose(suggestions[Number(option.value)])}
        />
      )}
    </div>
  );
};

export default AddressInput;
