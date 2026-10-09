"use client";

import { useState } from "react";
import { createCategory, updateCategory, type AdminCategory } from "@/entities/category";
import type { ListingKind } from "@/entities/listing";
import { errorMessage } from "@/shared/lib/errors";
import { slugify } from "@/shared/lib/slug";

export type CategoryFields = {
  name: string;
  slug: string;
  kind: ListingKind;
  parentId: string;
  isActive: boolean;
};

/** Поля новой категории или правки существующей. */
const initialFields = (
  category?: AdminCategory,
  parent?: AdminCategory | null,
): CategoryFields => ({
  name: category?.name ?? "",
  slug: category?.slug ?? "",
  kind: category?.kind ?? parent?.kind ?? "product",
  parentId: String(category?.parent_id ?? parent?.id ?? ""),
  isActive: category?.is_active ?? true,
});

/** Форма категории: у новой адрес сам собирается из названия, пока его не поправили руками. */
export const useCategoryForm = (
  category: AdminCategory | undefined,
  parent: AdminCategory | null | undefined,
  onSaved: () => void,
) => {
  const [fields, setFields] = useState(() => initialFields(category, parent));
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (patch: Partial<CategoryFields>) =>
    setFields((current) => ({ ...current, ...patch }));

  const changeName = (name: string) => change(slugEdited ? { name } : { name, slug: slugify(name) });

  const changeSlug = (slug: string) => {
    setSlugEdited(true);
    change({ slug });
  };

  const submit = async () => {
    setPending(true);
    setError(null);

    const parentId = fields.parentId ? Number(fields.parentId) : null;

    try {
      if (category) {
        await updateCategory(category.id, {
          parent_id: parentId,
          slug: fields.slug,
          name: fields.name,
          is_active: fields.isActive,
        });
      } else {
        await createCategory({
          parent_id: parentId,
          kind: fields.kind,
          slug: fields.slug,
          name: fields.name,
        });
      }
      onSaved();
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось сохранить категорию"));
    }

    setPending(false);
  };

  return { fields, pending, error, change, changeName, changeSlug, submit };
};
