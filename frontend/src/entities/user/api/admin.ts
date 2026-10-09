import { request } from "@/shared/api";
import type { AdminUser, AdminUserPage } from "../model/types";

/** Пользователи для админки: поиск по почте и имени, новые первыми. */
export const fetchAdminUsers = (query: string, limit: number, offset: number) =>
  request<AdminUserPage>(
    `/v1/admin/users?q=${encodeURIComponent(query.trim())}&limit=${limit}&offset=${offset}`,
  );

/** Пользователь для админки. */
export const fetchAdminUser = (id: number) => request<AdminUser>(`/v1/admin/users/${id}`);
