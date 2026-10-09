import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserProvider } from "@/entities/user";
import { getSessionUser, sessionHeaders } from "@/entities/user/server";
import AdminShell from "@/widgets/admin-shell";

export const metadata: Metadata = {
  title: "Администрирование",
  robots: { index: false, follow: false },
};

/** Админка: только для администраторов, остальным — 404. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headers = await sessionHeaders();
  const user = headers ? await getSessionUser(headers) : null;

  if (!user?.is_admin) notFound();

  return (
    <UserProvider initialUser={user}>
      <AdminShell>{children}</AdminShell>
    </UserProvider>
  );
}
