"use client";

import { useState, type ComponentProps } from "react";
import Button from "@/shared/ui/button";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import CatalogFilters from "../catalog-filters";
import styles from "./style.module.scss";

type FiltersButtonProps = Omit<ComponentProps<typeof CatalogFilters>, "onApplied"> & {
  count: number;
};

/** Кнопка «Фильтры» до ПК: панель открывается в окне и закрывается после «Показать». */
const FiltersButton = ({ count, ...filters }: FiltersButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className={styles.button} variant="secondary" onClick={() => setOpen(true)}>
        {count > 0 ? `Фильтры · ${count}` : "Фильтры"}
      </Button>

      {open && (
        <Modal open onClose={() => setOpen(false)} ariaLabel="Фильтры">
          <div className={styles.content}>
            <Title>Фильтры</Title>
            <CatalogFilters {...filters} onApplied={() => setOpen(false)} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default FiltersButton;
