"use client";

import Dropdown from "@/shared/ui/dropdown";
import { useRegions } from "../../model/use-regions";
import styles from "./style.module.scss";

const ALL_REGIONS = "Все регионы России";

type RegionSelectProps = {
  id: string;
  value: string;
  onChange: (region: string) => void;
};

/** Регион, в котором искать населённый пункт. Пустое значение — вся Россия. */
const RegionSelect = ({ id, value, onChange }: RegionSelectProps) => {
  const regions = useRegions();
  const options = [
    { value: "", label: ALL_REGIONS },
    ...regions.map((region) => ({ value: region, label: region })),
  ];

  return (
    <div className={styles.region}>
      <label className={styles.label} htmlFor={id}>
        Регион поиска
      </label>
      <Dropdown
        id={id}
        value={value}
        options={options}
        placeholder={ALL_REGIONS}
        searchable
        searchPlaceholder="Найти регион"
        onChange={onChange}
      />
    </div>
  );
};

export default RegionSelect;
