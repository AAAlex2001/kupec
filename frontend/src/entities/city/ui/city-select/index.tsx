"use client";

import cn from "classnames";
import { useState, type KeyboardEvent } from "react";
import { ChevronDownIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import OptionList from "@/shared/ui/option-list";
import { cityLabel } from "../../lib/label";
import { useCitySearch } from "../../model/use-city-search";
import type { City } from "../../model/types";
import styles from "./style.module.scss";

type CitySelectProps = {
  id: string;
  value: City | null;
  onChange: (city: City | null) => void;
};

/** Выбор населённого пункта с поиском по началу названия. Пустое поле — город не указан. */
const CitySelect = ({ id, value, onChange }: CitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const cities = useCitySearch(open, draft ?? "");
  const listId = `${id}-list`;

  const choose = (city: City) => {
    onChange(city);
    setDraft(null);
    setOpen(false);
  };

  const leave = () => {
    if (draft === "") onChange(null);
    setDraft(null);
    setOpen(false);
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) =>
        Math.min(cities.length - 1, Math.max(0, index + (event.key === "ArrowDown" ? 1 : -1))),
      );
    } else if (event.key === "Enter" && open && cities[active]) {
      event.preventDefault();
      choose(cities[active]);
    } else if (event.key === "Escape") {
      leave();
    }
  };

  return (
    <div className={cn(styles.select, open && styles.open)}>
      <Input
        id={id}
        role="combobox"
        ariaExpanded={open}
        ariaControls={listId}
        autoComplete="off"
        placeholder="Начните вводить название"
        value={draft ?? (value ? cityLabel(value) : "")}
        onFocus={() => setOpen(true)}
        onBlur={leave}
        onChange={(text) => {
          setDraft(text);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={handleKey}
        suffix={<ChevronDownIcon className={styles.chevron} />}
      />

      {open && (
        <OptionList
          id={listId}
          options={cities.map((city) => ({
            value: String(city.id),
            label: city.name,
            hint: city.district,
          }))}
          selected={value ? String(value.id) : null}
          active={active}
          onChoose={(option) => {
            const city = cities.find((item) => String(item.id) === option.value);
            if (city) choose(city);
          }}
        />
      )}
    </div>
  );
};

export default CitySelect;
