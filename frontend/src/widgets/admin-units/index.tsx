"use client";

import { useState } from "react";
import { UNIT_KINDS, UnitActions, UnitModal } from "@/features/manage-unit";
import Button from "@/shared/ui/button";
import { PlusIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useUnits } from "./model/use-units";
import styles from "./style.module.scss";

/** Админка «Единицы»: за что указана цена — отдельно для товаров и для услуг. */
const AdminUnits = () => {
  const { units, error, reload } = useUnits();
  const [creating, setCreating] = useState(false);

  const created = () => {
    setCreating(false);
    reload();
  };

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Title as="h1">Единицы цены</Title>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon />
          Новая единица
        </Button>
      </div>

      <p className={styles.hint}>
        Продавец выбирает единицу рядом с ценой: «450 ₽ / банка». Единицу из объявлений удалить
        нельзя — только переименовать.
      </p>

      {error && <Notice tone="error">{error}</Notice>}
      {!units && !error && <Loader />}

      {units &&
        UNIT_KINDS.map((kind) => (
          <div key={kind.value} className={styles.group}>
            <p className={styles.label}>{kind.label}</p>

            <div className={styles.list}>
              {units
                .filter((unit) => unit.kind === kind.value)
                .map((unit) => (
                  <div key={unit.id} className={styles.row}>
                    <p className={styles.name}>
                      {unit.label} <span className={styles.code}>{unit.code}</span>
                    </p>
                    <UnitActions unit={unit} onDone={reload} />
                  </div>
                ))}
            </div>
          </div>
        ))}

      {creating && <UnitModal onClose={() => setCreating(false)} onSaved={created} />}
    </section>
  );
};

export default AdminUnits;
