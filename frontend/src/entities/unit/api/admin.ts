import { jsonBody, request } from "@/shared/api";
import type { CategoryUnits, Unit, UnitCreatePayload } from "../model/types";

/** Справочник единиц цены. */
export const fetchUnits = () => request<Unit[]>("/v1/admin/units");

/** Добавить единицу. */
export const createUnit = (payload: UnitCreatePayload) =>
  request<Unit>("/v1/admin/units", jsonBody("POST", payload));

/** Переименовать единицу. Код и тип не меняются. */
export const updateUnit = (id: number, label: string) =>
  request<Unit>(`/v1/admin/units/${id}`, jsonBody("PUT", { label }));

/** Удалить единицу, которой нет в объявлениях. */
export const deleteUnit = (id: number) =>
  request<void>(`/v1/admin/units/${id}`, { method: "DELETE" });

/** Свои единицы категории и те, что она берёт у родителя. */
export const fetchCategoryUnits = (categoryId: number) =>
  request<CategoryUnits>(`/v1/admin/categories/${categoryId}/units`);

/** Задать свои единицы категории по порядку. Пустой список — брать у родителя. */
export const saveCategoryUnits = (categoryId: number, unitIds: number[]) =>
  request<void>(`/v1/admin/categories/${categoryId}/units`, jsonBody("PUT", { unit_ids: unitIds }));
