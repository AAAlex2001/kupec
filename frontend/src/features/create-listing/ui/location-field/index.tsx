"use client";

import { useId } from "react";
import Field from "@/shared/ui/field";
import YandexMap from "@/shared/ui/yandex-map";
import { useLocationPicker } from "../../model/use-location-picker";
import type { ListingFields } from "../../model/types";
import AddressInput from "../address-input";
import styles from "./style.module.scss";

type LocationFieldProps = {
  fields: ListingFields;
  onChange: (changes: Partial<ListingFields>) => void;
};

/** Адрес и карта: выбрать адрес из подсказок или поставить точку кликом. */
const LocationField = ({ fields, onChange }: LocationFieldProps) => {
  const id = useId();
  const { choose, pick } = useLocationPicker(onChange);

  return (
    <div className={styles.location}>
      <Field label="Адрес" htmlFor={id} hint="Выберите адрес из подсказок или кликните по карте">
        <AddressInput
          id={id}
          value={fields.address}
          city={fields.city}
          onChange={(address) => onChange({ address })}
          onChoose={choose}
        />
      </Field>

      <YandexMap point={fields.point} onPick={pick} />
    </div>
  );
};

export default LocationField;
