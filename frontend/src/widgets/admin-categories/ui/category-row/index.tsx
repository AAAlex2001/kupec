import cn from "classnames";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { CategoryLine } from "@/entities/category";
import { plural } from "@/shared/lib/format";
import styles from "./style.module.scss";

type CategoryRowProps = {
  line: CategoryLine;
  actions: ReactNode;
};

const LISTINGS: [string, string, string] = ["объявление", "объявления", "объявлений"];

/** Строка дерева: отступ по глубине, картинка, название, адрес, отметки и действия. */
const CategoryRow = ({ line, actions }: CategoryRowProps) => {
  const { category, depth } = line;

  return (
    <div
      className={cn(styles.row, !category.is_active && styles.hidden)}
      style={{ "--depth": depth } as CSSProperties}
    >
      <div className={styles.thumb}>
        {category.image_url && <Image src={category.image_url} alt="" fill sizes="48px" unoptimized />}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{category.name}</p>
        <p className={styles.meta}>
          {[
            category.slug,
            category.kind === "service" ? "услуги" : "товары",
            category.listings_count > 0 &&
              `${category.listings_count} ${plural(category.listings_count, LISTINGS)}`,
            !category.is_active && "скрыта",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {actions}
    </div>
  );
};

export default CategoryRow;
