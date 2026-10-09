"use client";

import type { ComponentType } from "react";
import type { AttributeType, CategoryField } from "@/entities/attribute";
import type { ValueRange } from "@/entities/listing";
import Checkbox from "@/shared/ui/checkbox";
import CheckList from "@/shared/ui/check-list";
import {
  attributeKey,
  CHOICES_LIMIT,
  NUMBER_EMPTY_MAX,
  splitChoices,
  type Filters,
} from "../../lib/params";
import RangeFilter from "../range-filter";

type FieldFilterProps = {
  field: CategoryField;
  ranges: Record<string, ValueRange>;
  draft: Filters;
  onSet: (key: string, value: string) => void;
};

/** Число «от — до» ползунком. */
const NumberFilter = ({ field, ranges, draft, onSet }: FieldFilterProps) => (
  <RangeFilter
    fromKey={attributeKey(field.slug, "from")}
    toKey={attributeKey(field.slug, "to")}
    range={ranges[field.slug]}
    emptyMax={NUMBER_EMPTY_MAX}
    unit={field.unit}
    draft={draft}
    onSet={onSet}
  />
);

/** Варианты флажками — подходит любой из отмеченных. */
const ChoiceFilter = ({ field, draft, onSet }: FieldFilterProps) => {
  const key = attributeKey(field.slug);

  return (
    <CheckList
      options={field.options}
      values={splitChoices(draft[key])}
      limit={CHOICES_LIMIT}
      onChange={(values) => onSet(key, values.join(","))}
    />
  );
};

/** Только объявления, где ответ «да». */
const FlagFilter = ({ field, draft, onSet }: FieldFilterProps) => {
  const key = attributeKey(field.slug);

  return (
    <Checkbox checked={draft[key] === "1"} onChange={(checked) => onSet(key, checked ? "1" : "")}>
      Да
    </Checkbox>
  );
};

const FILTERS: Partial<Record<AttributeType, ComponentType<FieldFilterProps>>> = {
  number: NumberFilter,
  select: ChoiceFilter,
  multiselect: ChoiceFilter,
  boolean: FlagFilter,
};

/** Фильтр по атрибуту — свой для каждого типа. У текста фильтра нет. */
const FieldFilter = (props: FieldFilterProps) => {
  const Filter = FILTERS[props.field.type];

  return Filter ? <Filter {...props} /> : null;
};

/** Есть ли у атрибута фильтр в каталоге. */
export const isFilterable = (field: CategoryField) =>
  field.is_filterable && FILTERS[field.type] !== undefined;

export default FieldFilter;
