"use client";

import type { AdminCategory } from "@/entities/category";
import ActionMenu, { type MenuAction } from "@/shared/ui/action-menu";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { useCategoryActions } from "../../model/use-category-actions";
import CategoryAttributesModal from "../category-attributes-modal";
import CategoryModal from "../category-modal";
import CategoryUnitsModal from "../category-units-modal";
import styles from "./style.module.scss";

type CategoryActionsProps = {
  category: AdminCategory;
  tree: AdminCategory[];
  onDone: () => void;
};

/** Меню «⋯» категории: изменить, подкатегория, атрибуты, единицы цены, выше, ниже, удалить. */
const CategoryActions = ({ category, tree, onDone }: CategoryActionsProps) => {
  const actions = useCategoryActions(category, onDone);
  const close = () => actions.setDialog(null);

  const canHaveChildren = category.listings_count === 0;

  const items: MenuAction[] = [
    { label: "Изменить", onClick: () => actions.setDialog("edit") },
    ...(canHaveChildren
      ? [{ label: "Добавить подкатегорию", onClick: () => actions.setDialog("child") }]
      : []),
    { label: "Атрибуты", onClick: () => actions.setDialog("attributes") },
    { label: "Единицы цены", onClick: () => actions.setDialog("units") },
    { label: "Выше", onClick: actions.moveUp },
    { label: "Ниже", onClick: actions.moveDown },
    { label: "Удалить", danger: true, onClick: () => actions.setDialog("delete") },
  ];

  return (
    <div className={styles.actions}>
      {actions.error && !actions.dialog && <p className={styles.error}>{actions.error}</p>}

      <ActionMenu ariaLabel={`Действия с категорией «${category.name}»`} actions={items} />

      {actions.dialog === "edit" && (
        <CategoryModal
          tree={tree}
          category={category}
          onClose={close}
          onSaved={actions.saved}
          onChanged={onDone}
        />
      )}

      {actions.dialog === "child" && (
        <CategoryModal
          tree={tree}
          parent={category}
          onClose={close}
          onSaved={actions.saved}
          onChanged={onDone}
        />
      )}

      {actions.dialog === "attributes" && (
        <CategoryAttributesModal category={category} onClose={close} onSaved={actions.saved} />
      )}

      {actions.dialog === "units" && (
        <CategoryUnitsModal category={category} onClose={close} onSaved={actions.saved} />
      )}

      <ConfirmModal
        open={actions.dialog === "delete"}
        title={`Удалить «${category.name}»?`}
        text={actions.error ?? "Удалить можно только пустую категорию: без подкатегорий и объявлений."}
        confirmLabel="Удалить"
        pending={actions.pending}
        onConfirm={actions.remove}
        onClose={close}
      />
    </div>
  );
};

export default CategoryActions;
