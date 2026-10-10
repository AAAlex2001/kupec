import type { Metadata } from "next";
import Notifications from "@/widgets/notifications";

export const metadata: Metadata = {
  title: "Уведомления",
};

/** Уведомления пользователя. */
export default function NotificationsPage() {
  return <Notifications />;
}
