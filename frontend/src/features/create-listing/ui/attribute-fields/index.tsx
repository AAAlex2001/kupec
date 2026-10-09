"use client";

import { useId } from "react";
import type { CategoryField } from "@/entities/attribute";
import Field from "@/shared/ui/field";
import type { AttributeDraft, AttributeDrafts, ListingErrors } from "../../model/types";
import AttributeInput from "../attribute-input";
import styles from "./style.module.scss";

type AttributeFieldsProps = {
  fields: CategoryField[];
  values: AttributeDrafts;
  errors: ListingErrors;
  onChange: (slug: string, value: AttributeDraft) => void;
};

/** «Характеристики»: атрибуты выбранной категории, обязательные — со звёздочкой. */
const AttributeFields = ({ fields, values, errors, onChange }: AttributeFieldsProps) => {
  const id = useId();

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Характеристики</h2>

      <div className={styles.grid}>
        {fields.map((field) => {
          const error = errors[`attributes.${field.slug}`];

          return (
            <Field
              key={field.slug}
              label={field.is_required ? `${field.name} *` : field.name}
              htmlFor={`${id}-${field.slug}`}
              error={error}
            >
              <AttributeInput
                id={`${id}-${field.slug}`}
                field={field}
                value={values[field.slug]}
                invalid={Boolean(error)}
                onChange={(value) => onChange(field.slug, value)}
              />
            </Field>
          );
        })}
      </div>
    </section>
  );
};

export default AttributeFields;
