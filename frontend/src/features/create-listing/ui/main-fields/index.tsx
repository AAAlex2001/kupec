"use client";

import { useId } from "react";
import type { Category, ListingKind } from "@/entities/listing";
import Chips from "@/shared/ui/chips";
import Dropdown from "@/shared/ui/dropdown";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Textarea from "@/shared/ui/textarea";
import type { ListingErrors, ListingFields } from "../../model/types";
import styles from "./style.module.scss";

type MainFieldsProps = {
  fields: ListingFields;
  errors: ListingErrors;
  categories: Category[];
  onChange: (changes: Partial<ListingFields>) => void;
  onKindChange: (kind: ListingKind) => void;
};

const KINDS = [
  { value: "product", label: "Товар" },
  { value: "service", label: "Услуга" },
];

const DESCRIPTION_HINTS = {
  product: "Укажите состав, дату приготовления, хранение и количество, если это важно для товара.",
  service: "Расскажите, что входит в услугу, сколько она длится и что взять с собой.",
};

/** Тип объявления, категория, название и описание. */
const MainFields = ({ fields, errors, categories, onChange, onKindChange }: MainFieldsProps) => {
  const id = useId();
  const options = categories
    .filter((category) => category.kind === fields.kind)
    .map((category) => ({ value: String(category.id), label: category.name }));

  return (
    <section className={styles.section}>
      <Chips
        ariaLabel="Тип объявления"
        value={fields.kind}
        options={KINDS}
        onChange={(kind) => onKindChange(kind as ListingKind)}
      />

      <Field label="Категория *" htmlFor={`${id}-category`} error={errors.categoryId}>
        <Dropdown
          id={`${id}-category`}
          value={fields.categoryId}
          options={options}
          onChange={(categoryId) => onChange({ categoryId })}
          placeholder="Выберите категорию"
          invalid={Boolean(errors.categoryId)}
        />
      </Field>

      <Field label="Название *" htmlFor={`${id}-title`} error={errors.title}>
        <Input
          id={`${id}-title`}
          value={fields.title}
          onChange={(title) => onChange({ title })}
          placeholder={fields.kind === "product" ? "Солёные огурцы, банка 1 л" : "Массаж спины, 60 минут"}
          invalid={Boolean(errors.title)}
          maxLength={100}
        />
      </Field>

      <Field
        label="Описание *"
        htmlFor={`${id}-description`}
        error={errors.description}
        hint={DESCRIPTION_HINTS[fields.kind]}
      >
        <Textarea
          id={`${id}-description`}
          value={fields.description}
          onChange={(description) => onChange({ description })}
          invalid={Boolean(errors.description)}
          maxLength={3000}
        />
      </Field>
    </section>
  );
};

export default MainFields;
