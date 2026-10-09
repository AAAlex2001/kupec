import { chainLabel, lastOf } from "../../lib/chains";
import type { CategoryNode } from "../../model/types";
import styles from "./style.module.scss";

type CategoryResultsProps = {
  results: CategoryNode[][];
  onChoose: (chain: CategoryNode[]) => void;
};

/** Найденные по названию категории с путём до них. */
const CategoryResults = ({ results, onChoose }: CategoryResultsProps) => {
  if (results.length === 0) return <p className={styles.empty}>Ничего не нашлось</p>;

  return (
    <ul className={styles.results}>
      {results.map((chain) => (
        <li key={lastOf(chain).id}>
          <button type="button" className={styles.item} onClick={() => onChoose(chain)}>
            <span className={styles.name}>{lastOf(chain).name}</span>
            <span className={styles.path}>{chainLabel(chain.slice(0, -1))}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CategoryResults;
