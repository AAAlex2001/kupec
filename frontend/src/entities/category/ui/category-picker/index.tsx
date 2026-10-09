"use client";

import Button from "@/shared/ui/button";
import { SearchIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import Title from "@/shared/ui/title";
import { chainLabel } from "../../lib/chains";
import type { CategoryNode } from "../../model/types";
import { useCategoryPicker } from "../../model/use-category-picker";
import CategoryColumn from "../category-column";
import CategoryDrill from "../category-drill";
import CategoryResults from "../category-results";
import styles from "./style.module.scss";

type CategoryPickerProps = {
  tree: CategoryNode[];
  selectedId: number | null;
  leafOnly: boolean;
  onSelect: (category: CategoryNode) => void;
  onClose: () => void;
};

/** Окно «Выберите категорию»: поиск, колонки на ПК или уровни с «назад» до ПК, путь. leafOnly — только конечная. */
const CategoryPicker = ({ tree, selectedId, leafOnly, onSelect, onClose }: CategoryPickerProps) => {
  const picker = useCategoryPicker(tree, selectedId);
  const canChoose = picker.selected !== null && (!leafOnly || picker.selected.children.length === 0);

  return (
    <Modal open wide onClose={onClose} ariaLabel="Выберите категорию">
      <div className={styles.picker}>
        <Title>Выберите категорию</Title>

        <Input
          value={picker.query}
          onChange={picker.setQuery}
          placeholder="Поиск по названию категории"
          ariaLabel="Поиск по названию категории"
          maxLength={100}
          icon={<SearchIcon className={styles.searchIcon} />}
          autoFocus
        />

        {picker.query ? (
          <div className={styles.body}>
            <CategoryResults results={picker.results} onChoose={picker.choose} />
          </div>
        ) : (
          <>
            <div className={styles.columns}>
              {picker.columns.map((nodes, depth) => (
                <CategoryColumn
                  key={depth}
                  nodes={nodes}
                  activeId={picker.chain[depth]?.id ?? null}
                  onOpen={(node) => picker.open(depth, node)}
                />
              ))}
            </div>

            <div className={styles.levels}>
              <CategoryDrill
                nodes={picker.columns[picker.level]}
                activeId={picker.chain[picker.level]?.id ?? null}
                backLabel={picker.level > 0 ? picker.backLabel : null}
                onOpen={(node) => picker.open(picker.level, node)}
                onBack={picker.back}
              />
            </div>
          </>
        )}

        <p className={styles.path}>{chainLabel(picker.chain) || "Категория не выбрана"}</p>

        <div className={styles.buttons}>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            disabled={!canChoose}
            onClick={() => picker.selected && onSelect(picker.selected)}
          >
            Выбрать
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryPicker;
