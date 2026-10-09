import { ChevronLeftIcon } from "@/shared/ui/icons";
import type { CategoryNode } from "../../model/types";
import CategoryColumn from "../category-column";
import styles from "./style.module.scss";

type CategoryDrillProps = {
  nodes: CategoryNode[];
  activeId: number | null;
  backLabel: string | null;
  onOpen: (node: CategoryNode) => void;
  onBack: () => void;
};

/** Один уровень на всю ширину для мобилки: «‹ назад» к прошлому уровню и список категорий. */
const CategoryDrill = ({ nodes, activeId, backLabel, onOpen, onBack }: CategoryDrillProps) => (
  <div className={styles.drill}>
    {backLabel && (
      <button type="button" className={styles.back} onClick={onBack}>
        <ChevronLeftIcon className={styles.arrow} />
        {backLabel}
      </button>
    )}

    <CategoryColumn nodes={nodes} activeId={activeId} onOpen={onOpen} full />
  </div>
);

export default CategoryDrill;
