"use client";

import type { CategoryField } from "@/entities/attribute";
import type { Option, ValueRange } from "@/entities/listing";
import Button from "@/shared/ui/button";
import Chips from "@/shared/ui/chips";
import CheckList from "@/shared/ui/check-list";
import { CHOICES_LIMIT, PRICE_EMPTY_MAX, splitChoices, type Filters } from "../../lib/params";
import { useFilterDraft } from "../../model/use-filter-draft";
import FieldFilter, { isFilterable } from "../field-filter";
import FilterSection from "../filter-section";
import RangeFilter from "../range-filter";
import styles from "./style.module.scss";

const KINDS = [
  { value: "", label: "Все" },
  { value: "product", label: "Товары" },
  { value: "service", label: "Услуги" },
];

type CatalogFiltersProps = {
  filters: Filters;
  fields: CategoryField[];
  places: Option[];
  ranges: Record<string, ValueRange>;
  showKind: boolean;
  onApplied?: () => void;
};

/** Панель фильтров в духе Авито: тип, цена и числа ползунками, место услуги и варианты галочками. */
const CatalogFilters = ({
  filters,
  fields,
  places,
  ranges,
  showKind,
  onApplied,
}: CatalogFiltersProps) => {
  const { draft, set, apply, reset } = useFilterDraft(filters, onApplied);

  return (
    <form
      className={styles.filters}
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      {showKind && (
        <FilterSection title="Что ищем">
          <Chips
            ariaLabel="Товары или услуги"
            value={draft.kind ?? ""}
            options={KINDS}
            onChange={(kind) => set("kind", kind)}
          />
        </FilterSection>
      )}

      <FilterSection title="Цена, ₽">
        <RangeFilter
          fromKey="price_from"
          toKey="price_to"
          range={ranges.price}
          emptyMax={PRICE_EMPTY_MAX}
          draft={draft}
          onSet={set}
        />
      </FilterSection>

      {places.length > 0 && (
        <FilterSection title="Где проходит">
          <CheckList
            options={places.map((place) => ({ value: place.code, label: place.label }))}
            values={splitChoices(draft.place)}
            limit={CHOICES_LIMIT}
            onChange={(values) => set("place", values.join(","))}
          />
        </FilterSection>
      )}

      {fields.filter(isFilterable).map((field) => (
        <FilterSection key={field.slug} title={field.name}>
          <FieldFilter field={field} ranges={ranges} draft={draft} onSet={set} />
        </FilterSection>
      ))}

      <div className={styles.buttons}>
        <Button type="submit">Показать</Button>
        <Button variant="ghost" onClick={reset}>
          Сбросить
        </Button>
      </div>
    </form>
  );
};

export default CatalogFilters;
