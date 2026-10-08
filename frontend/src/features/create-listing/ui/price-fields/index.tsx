"use client";

import { useId } from "react";
import type { UnitOption } from "@/entities/listing";
import Dropdown from "@/shared/ui/dropdown";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import type { ListingErrors, ListingFields } from "../../model/types";
import styles from "./style.module.scss";

type PriceFieldsProps = {
  fields: ListingFields;
  errors: ListingErrors;
  units: UnitOption[];
  onChange: (changes: Partial<ListingFields>) => void;
};

/** Цена в рублях и единица, за которую она указана. */
const PriceFields = ({ fields, errors, units, onChange }: PriceFieldsProps) => {
  const id = useId();
  const options = units
    .filter((unit) => unit.kind === fields.kind)
    .map((unit) => ({ value: unit.code, label: unit.label }));

  return (
    <div className={styles.price}>
      <div className={styles.row}>
        <Field label="Цена, ₽ *" htmlFor={`${id}-price`} error={errors.price}>
          <Input
            id={`${id}-price`}
            value={fields.price}
            onChange={(price) => onChange({ price: price.replace(/\D/g, "") })}
            placeholder="0"
            invalid={Boolean(errors.price)}
            maxLength={9}
            inputMode="numeric"
          />
        </Field>

        <Field label="Единица *" htmlFor={`${id}-unit`} error={errors.unit}>
          <Dropdown
            id={`${id}-unit`}
            value={fields.unit}
            options={options}
            onChange={(unit) => onChange({ unit })}
            placeholder="Выберите"
            invalid={Boolean(errors.unit)}
          />
        </Field>
      </div>

      <p className={styles.hint}>Для товара: кг, банка или штука. Для услуги: час или сеанс.</p>
    </div>
  );
};

export default PriceFields;
