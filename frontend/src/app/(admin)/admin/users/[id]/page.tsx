import AdminUser from "@/widgets/admin-user";

type AdminUserPageProps = {
  params: Promise<{ id: string }>;
};

/** Админка: пользователь и его объявления. */
export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { id } = await params;

  return <AdminUser userId={Number(id)} />;
}
