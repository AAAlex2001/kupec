"use client";

import type { AdminCategory } from "@/entities/category";
import Button from "@/shared/ui/button";
import CheckList from "@/shared/ui/check-list";
import Loader from "@/shared/ui/loader";
import Modal from "@/shared/ui/modal";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useCategoryUnits } from "../../model/use-category-units";
import styles from "./style.module.scss";

type CategoryUnitsModalProps = {
  category: AdminCategory;
  onClose: () => void;
  onSaved: () => void;
};

/** Сейчас в категории: свои единицы, единицы родителя или все единицы типа. */
const currentText = (labels: string[], from: string | null) =>
  from
    ? `Сейчас берутся из «${from}»: ${labels.join(", ")}.`
    : "Сейчас доступны все единицы этого типа.";

/** Окно «Единицы цены»: какие единицы предлагать продавцу в этой категории и её подкатегориях. */
const CategoryUnitsModal = ({ category, onClose, onSaved }: CategoryUnitsModalProps) => {
  const units = useCategoryUnits(category, onSaved);
  const title = `Единицы цены «${category.name}»`;

  return (
    <Modal open onClose={onClose} ariaLabel={title}>
      <div className={styles.content}>
        <Title>{title}</Title>

        {!units.all && !units.error && <Loader />}

        {units.bound && units.bound.own.length === 0 && (
          <p className={styles.hint}>
            {currentText(
              units.bound.inherited.map((unit) => unit.label),
              units.bound.inherited_from,
            )}
          </p>
        )}

        {units.all && (
          <CheckList
            options={units.all.map((unit) => ({ value: String(unit.id), label: unit.label }))}
            values={units.selected}
            onChange={units.setSelected}
          />
        )}

        <p className={styles.hint}>
          Подкатегории без своих единиц берут эти. Ничего не отмечено — единицы берутся у родителя.
        </p>

        {units.error && <Notice tone="error">{units.error}</Notice>}

        <div className={styles.buttons}>
          <Button
            className={styles.button}
            loading={units.pending}
            disabled={!units.all}
            onClick={units.save}
          >
            Сохранить
          </Button>
          <Button className={styles.button} variant="ghost" disabled={units.pending} onClick={onClose}>
            Отменить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryUnitsModal;
