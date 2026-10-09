import { jsonBody, request } from "@/shared/api";
import type {
  Attribute,
  AttributeCreatePayload,
  AttributeUpdatePayload,
  CategoryAttributeItem,
  CategoryAttributes,
} from "../model/types";

/** Справочник атрибутов с вариантами. */
export const fetchAttributes = () => request<Attribute[]>("/v1/admin/attributes");

/** Добавить атрибут в справочник. */
export const createAttribute = (payload: AttributeCreatePayload) =>
  request<Attribute>("/v1/admin/attributes", jsonBody("POST", payload));

/** Изменить название, единицу, фильтр и варианты атрибута. */
export const updateAttribute = (id: number, payload: AttributeUpdatePayload) =>
  request<Attribute>(`/v1/admin/attributes/${id}`, jsonBody("PUT", payload));

/** Удалить атрибут из справочника и из всех категорий. */
export const deleteAttribute = (id: number) =>
  request<void>(`/v1/admin/attributes/${id}`, { method: "DELETE" });

/** Свои и унаследованные атрибуты категории. */
export const fetchCategoryAttributes = (categoryId: number) =>
  request<CategoryAttributes>(`/v1/admin/categories/${categoryId}/attributes`);

/** Задать свои атрибуты категории по порядку. */
export const saveCategoryAttributes = (categoryId: number, items: CategoryAttributeItem[]) =>
  request<void>(`/v1/admin/categories/${categoryId}/attributes`, jsonBody("PUT", { items }));
