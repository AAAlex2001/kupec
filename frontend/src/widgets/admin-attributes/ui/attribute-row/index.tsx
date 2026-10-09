import type { ReactNode } from "react";
import { attributeTypeLabel, hasOptions, type Attribute } from "@/entities/attribute";
import styles from "./style.module.scss";

type AttributeRowProps = {
  attribute: Attribute;
  actions: ReactNode;
};

/** Описание атрибута одной строкой: «vid · Один из списка · 3 варианта · в фильтрах». */
const attributeMeta = (attribute: Attribute) =>
  [
    attribute.slug,
    attributeTypeLabel(attribute.type),
    attribute.unit,
    hasOptions(attribute.type) && attribute.options.map((option) => option.label).join(", "),
    attribute.is_filterable && attribute.type !== "text" && "в фильтрах",
  ]
    .filter(Boolean)
    .join(" · ");

/** Строка справочника: название, описание и действия. */
const AttributeRow = ({ attribute, actions }: AttributeRowProps) => (
  <div className={styles.row}>
    <div className={styles.info}>
      <p className={styles.name}>{attribute.name}</p>
      <p className={styles.meta}>{attributeMeta(attribute)}</p>
    </div>

    {actions}
  </div>
);

export default AttributeRow;
