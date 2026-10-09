import cn from "classnames";
import { ChevronRightIcon } from "@/shared/ui/icons";
import type { CategoryNode } from "../../model/types";
import styles from "./style.module.scss";

type CategoryColumnProps = {
  nodes: CategoryNode[];
  activeId: number | null;
  onOpen: (node: CategoryNode) => void;
  full?: boolean;
};

/** Колонка одного уровня: категории списком, у кого есть подкатегории — со стрелкой. full — на всю ширину. */
const CategoryColumn = ({ nodes, activeId, onOpen, full }: CategoryColumnProps) => (
  <ul className={cn(styles.column, full && styles.full)}>
    {nodes.map((node) => (
      <li key={node.id}>
        <button
          type="button"
          className={cn(styles.item, node.id === activeId && styles.active)}
          aria-pressed={node.id === activeId}
          onClick={() => onOpen(node)}
        >
          <span className={styles.name}>{node.name}</span>
          {node.children.length > 0 && <ChevronRightIcon className={styles.arrow} />}
        </button>
      </li>
    ))}
  </ul>
);

export default CategoryColumn;
