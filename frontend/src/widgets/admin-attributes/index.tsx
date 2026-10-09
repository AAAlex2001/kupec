"use client";

import { useState } from "react";
import { AttributeActions, AttributeModal } from "@/features/manage-attribute";
import Button from "@/shared/ui/button";
import { PlusIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useAttributes } from "./model/use-attributes";
import AttributeRow from "./ui/attribute-row";
import styles from "./style.module.scss";

/** Админка «Атрибуты»: справочник характеристик, которые потом привязывают к категориям. */
const AdminAttributes = () => {
  const { attributes, error, reload } = useAttributes();
  const [creating, setCreating] = useState(false);

  const created = () => {
    setCreating(false);
    reload();
  };

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Title as="h1">Атрибуты</Title>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon />
          Новый атрибут
        </Button>
      </div>

      <p className={styles.hint}>
        Атрибут — характеристика объявления: вес, вид, год выпуска. Привяжите его к категории в
        разделе «Категории» — он появится в форме объявления, в карточке и в фильтрах этой категории
        и всех её подкатегорий.
      </p>

      {error && <Notice tone="error">{error}</Notice>}
      {!attributes && !error && <Loader />}
      {attributes?.length === 0 && <p className={styles.hint}>Атрибутов пока нет.</p>}

      {attributes && attributes.length > 0 && (
        <div className={styles.list}>
          {attributes.map((attribute) => (
            <AttributeRow
              key={attribute.id}
              attribute={attribute}
              actions={<AttributeActions attribute={attribute} onDone={reload} />}
            />
          ))}
        </div>
      )}

      {creating && <AttributeModal onClose={() => setCreating(false)} onSaved={created} />}
    </section>
  );
};

export default AdminAttributes;
