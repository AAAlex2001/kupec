"use client";

import type { ValueRange } from "@/entities/listing";
import RangeSlider from "@/shared/ui/range-slider";
import type { Filters } from "../../lib/params";

type RangeFilterProps = {
  fromKey: string;
  toKey: string;
  range?: ValueRange;
  emptyMax: number;
  unit?: string | null;
  draft: Filters;
  onSet: (key: string, value: string) => void;
};

/** Фильтр «от — до» ползунком: шкала до наибольшего значения в выдаче, а без значений — до emptyMax. */
const RangeFilter = ({ fromKey, toKey, range, emptyMax, unit, draft, onSet }: RangeFilterProps) => {
  const highest = Math.ceil(range?.max ?? 0);

  return (
    <RangeSlider
      max={highest > 0 ? highest : emptyMax}
      from={draft[fromKey] ?? ""}
      to={draft[toKey] ?? ""}
      unit={unit}
      onChange={(from, to) => {
        onSet(fromKey, from);
        onSet(toKey, to);
      }}
    />
  );
};

export default RangeFilter;
