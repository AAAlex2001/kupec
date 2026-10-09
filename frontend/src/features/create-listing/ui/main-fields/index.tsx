"use client";

import { useId } from "react";
import { CategorySelect, type CategoryNode } from "@/entities/category";
import type { ListingKind } from "@/entities/listing";
import Chips from "@/shared/ui/chips";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Textarea from "@/shared/ui/textarea";
import type { ListingErrors, ListingFields } from "../../model/types";
import styles from "./style.module.scss";

type MainFieldsProps = {
  fields: ListingFields;
  errors: ListingErrors;
  tree: CategoryNode[];
  onChange: (changes: Partial<ListingFields>) => void;
  onKindChange: (kind: ListingKind) => void;
};

const KINDS = [
  { value: "product", label: "Товар" },
  { value: "service", label: "Услуга" },
];

const DESCRIPTION_HINTS = {
  product:
    "Расскажите о состоянии, особенностях, комплекте и передаче товара. " +
    "Для продуктов укажите состав, дату изготовления и хранение.",
  service: "Расскажите, что входит в услугу, сколько она длится и что взять с собой.",
};

const TITLE_PLACEHOLDERS = {
  product: "Название, модель или вид товара",
  service: "Название услуги: что вы предлагаете",
};

/** Тип объявления, категория, название и описание. Категория выбирается в окне по колонкам. */
const MainFields = ({ fields, errors, tree, onChange, onKindChange }: MainFieldsProps) => {
  const id = useId();
  const sections = tree.filter((section) => section.kind === fields.kind);

  const chooseCategory = (category: CategoryNode) => {
    if (String(category.id) === fields.categoryId) return;
    onChange({ categoryId: String(category.id), unit: "", attributes: {} });
  };

  return (
    <section className={styles.section}>
      <Chips
        ariaLabel="Тип объявления"
        value={fields.kind}
        options={KINDS}
        onChange={(kind) => onKindChange(kind as ListingKind)}
      />

      <Field label="Категория *" htmlFor={`${id}-category`} error={errors.categoryId}>
        <CategorySelect
          id={`${id}-category`}
          tree={sections}
          value={fields.categoryId ? Number(fields.categoryId) : null}
          invalid={Boolean(errors.categoryId)}
          onChange={chooseCategory}
        />
      </Field>

      <Field label="Название *" htmlFor={`${id}-title`} error={errors.title}>
        <Input
          id={`${id}-title`}
          value={fields.title}
          onChange={(title) => onChange({ title })}
          placeholder={TITLE_PLACEHOLDERS[fields.kind]}
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
