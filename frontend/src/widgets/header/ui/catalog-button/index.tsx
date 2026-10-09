"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryPicker, type CategoryNode } from "@/entities/category";
import { categoryPath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { GridIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type CatalogButtonProps = {
  tree: CategoryNode[];
  className?: string;
};

/** «Все категории»: окно выбора категории, после выбора — её каталог. До ПК — только иконка. */
const CatalogButton = ({ tree, className }: CatalogButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        size="lg"
        ariaLabel="Все категории"
        onClick={() => setOpen(true)}
      >
        <GridIcon />
        <span className={styles.label}>Все категории</span>
      </Button>

      {open && (
        <CategoryPicker
          tree={tree}
          selectedId={null}
          leafOnly={false}
          onSelect={(category) => {
            setOpen(false);
            router.push(categoryPath(category.slug));
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default CatalogButton;
