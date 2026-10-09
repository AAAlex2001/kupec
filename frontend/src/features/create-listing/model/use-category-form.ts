"use client";

import { useEffect, useState } from "react";
import type { CategoryField } from "@/entities/attribute";
import { fetchCategoryForm } from "@/entities/category";
import type { Category } from "@/entities/listing";
import type { Unit } from "@/entities/unit";
import { reportError } from "@/shared/lib/report-error";

type CategoryForm = {
  slug: string;
  fields: CategoryField[];
  units: Unit[];
};

/** Атрибуты и единицы цены выбранной категории. Без категории — атрибутов нет, единицы null. */
export const useCategoryForm = (categories: Category[], categoryId: string) => {
  const [loaded, setLoaded] = useState<CategoryForm | null>(null);
  const slug = categories.find((category) => String(category.id) === categoryId)?.slug;

  useEffect(() => {
    if (!slug) return;

    let active = true;
    fetchCategoryForm(slug)
      .then((form) => active && setLoaded({ slug, ...form }))
      .catch(reportError);

    return () => {
      active = false;
    };
  }, [slug]);

  const current = slug && loaded?.slug === slug ? loaded : null;

  return { fields: current?.fields ?? [], units: current?.units ?? null };
};
