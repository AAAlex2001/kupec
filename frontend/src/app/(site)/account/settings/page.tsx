import type { Metadata } from "next";
import { AccountSettings } from "@/widgets/account";

export const metadata: Metadata = {
  title: "Настройки",
};

/** Настройки профиля. */
export default function SettingsPage() {
  return <AccountSettings />;
}
