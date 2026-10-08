"use client";

import { useId } from "react";
import { CitySelect } from "@/entities/city";
import type { Option } from "@/entities/listing";
import Checkbox from "@/shared/ui/checkbox";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Notice from "@/shared/ui/notice";
import type { ListingErrors, ListingFields } from "../../model/types";
import LocationField from "../location-field";
import styles from "./style.module.scss";

type PlaceFieldsProps = {
  fields: ListingFields;
  errors: ListingErrors;
  servicePlaces: Option[];
  onChange: (changes: Partial<ListingFields>) => void;
};

/** Где встретиться: город, адрес на карте, а у услуги — место проведения и расписание. */
const PlaceFields = ({ fields, errors, servicePlaces, onChange }: PlaceFieldsProps) => {
  const id = useId();

  const togglePlace = (code: string, checked: boolean) =>
    onChange({
      servicePlaces: checked
        ? [...fields.servicePlaces, code]
        : fields.servicePlaces.filter((place) => place !== code),
    });

  return (
    <section className={styles.section}>
      {fields.kind === "service" && (
        <div className={styles.places}>
          <p className={styles.title}>Место проведения *</p>

          {servicePlaces.map((place) => (
            <Checkbox
              key={place.code}
              checked={fields.servicePlaces.includes(place.code)}
              onChange={(checked) => togglePlace(place.code, checked)}
            >
              {place.label}
            </Checkbox>
          ))}

          {errors.servicePlaces && <p className={styles.error}>{errors.servicePlaces}</p>}
        </div>
      )}

      <Field label="Город *" htmlFor={`${id}-city`} error={errors.city}>
        <CitySelect id={`${id}-city`} value={fields.city} onChange={(city) => onChange({ city })} />
      </Field>

      <LocationField fields={fields} onChange={onChange} />

      {fields.kind === "service" ? (
        <Field label="Расписание" htmlFor={`${id}-schedule`}>
          <Input
            id={`${id}-schedule`}
            value={fields.schedule}
            onChange={(schedule) => onChange({ schedule })}
            placeholder="Будни с 10:00 до 19:00, по договорённости"
            maxLength={200}
          />
        </Field>
      ) : (
        <Notice tone="info">
          Самовывоз. Время встречи обсудите с покупателем в сообщениях.
        </Notice>
      )}
    </section>
  );
};

export default PlaceFields;
