import { jsonBody, request } from "@/shared/api";
import type { Category } from "@/entities/listing";
import type { AdminCategory, CategoryCreatePayload, CategoryUpdatePayload } from "../model/types";

/** Всё дерево категорий для админки: со скрытыми и числом объявлений. */
export const fetchAdminCategories = () => request<AdminCategory[]>("/v1/admin/categories");

/** Добавить категорию в конец уровня. */
export const createCategory = (payload: CategoryCreatePayload) =>
  request<Category>("/v1/admin/categories", jsonBody("POST", payload));

/** Изменить название, адрес, видимость и родителя. */
export const updateCategory = (id: number, payload: CategoryUpdatePayload) =>
  request<Category>(`/v1/admin/categories/${id}`, jsonBody("PUT", payload));

/** Сдвинуть категорию выше или ниже среди соседних. */
export const moveCategory = (id: number, direction: "up" | "down") =>
  request<Category>(`/v1/admin/categories/${id}/move`, jsonBody("POST", { direction }));

/** Удалить пустую категорию. */
export const deleteCategory = (id: number) =>
  request<void>(`/v1/admin/categories/${id}`, { method: "DELETE" });

/** Загрузить картинку плитки. */
export const uploadCategoryImage = (id: number, file: File) => {
  const body = new FormData();
  body.append("file", file);

  return request<Category>(`/v1/admin/categories/${id}/image`, { method: "PUT", body });
};

/** Убрать картинку плитки. */
export const removeCategoryImage = (id: number) =>
  request<Category>(`/v1/admin/categories/${id}/image`, { method: "DELETE" });
