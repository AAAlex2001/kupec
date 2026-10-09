import { redirect } from "next/navigation";
import { ADMIN_USERS_PATH } from "@/shared/config/routes";

/** Вход в админку открывает список пользователей. */
export default function AdminPage() {
  redirect(ADMIN_USERS_PATH);
}
