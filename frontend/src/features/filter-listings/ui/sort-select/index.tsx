"use client";

import { usePathname, useRouter } from "next/navigation";
import Dropdown from "@/shared/ui/dropdown";
import { filtersQuery, type Filters } from "../../lib/params";
import styles from "./style.module.scss";

const SORTS = [
  { value: "new", label: "Сначала новые" },
  { value: "cheap", label: "Сначала дешевле" },
  { value: "expensive", label: "Сначала дороже" },
];

type SortSelectProps = {
  filters: Filters;
};

/** Порядок ленты. Меняется сразу, остальные фильтры сохраняются. */
const SortSelect = ({ filters }: SortSelectProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const change = (sort: string) => {
    const next: Filters = { ...filters, sort };
    if (sort === "new") delete next.sort;

    const query = filtersQuery(next);
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Dropdown
      id="listing-sort"
      className={styles.sort}
      value={filters.sort ?? "new"}
      options={SORTS}
      placeholder="Сначала новые"
      onChange={change}
    />
  );
};

export default SortSelect;
