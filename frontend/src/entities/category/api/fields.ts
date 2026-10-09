import { request } from "@/shared/api";
import type { CategoryPage } from "../model/types";

/** Атрибуты и единицы цены категории из браузера — для формы объявления. */
export const fetchCategoryForm = async (slug: string) => {
  const page = await request<CategoryPage>(`/v1/categories/${encodeURIComponent(slug)}`);

  return { fields: page.fields, units: page.units };
};
