"use client";

import { useState } from "react";
import { flattenCategories } from "@/entities/category";
import { CategoryActions, CategoryModal } from "@/features/manage-category";
import Button from "@/shared/ui/button";
import { PlusIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import { useAdminCategories } from "./model/use-admin-categories";
import CategoryRow from "./ui/category-row";
import styles from "./style.module.scss";

/** Админка «Категории»: всё дерево со скрытыми, новый раздел и действия у каждой категории. */
const AdminCategories = () => {
  const { tree, error, reload } = useAdminCategories();
  const [creating, setCreating] = useState(false);

  const created = () => {
    setCreating(false);
    reload();
  };

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Title as="h1">Категории</Title>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon />
          Новый раздел
        </Button>
      </div>

      <p className={styles.hint}>
        Объявления размещают только в категориях без подкатегорий. Скрытая категория прячет с сайта всю
        свою ветку.
      </p>

      {error && <Notice tone="error">{error}</Notice>}
      {!tree && !error && <Loader />}

      {tree && (
        <div className={styles.tree}>
          {flattenCategories(tree).map((line) => (
            <CategoryRow
              key={line.category.id}
              line={line}
              actions={<CategoryActions category={line.category} tree={tree} onDone={reload} />}
            />
          ))}
        </div>
      )}

      {creating && tree && (
        <CategoryModal
          tree={tree}
          parent={null}
          onClose={() => setCreating(false)}
          onSaved={created}
          onChanged={reload}
        />
      )}
    </section>
  );
};

export default AdminCategories;
