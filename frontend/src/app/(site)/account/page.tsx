import { redirect } from "next/navigation";
import { SETTINGS_PATH } from "@/shared/config/routes";

/** Вход в кабинет ведёт в настройки, пока других разделов нет. */
export default function AccountPage() {
  redirect(SETTINGS_PATH);
}
