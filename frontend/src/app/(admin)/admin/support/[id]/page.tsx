import AdminSupportThread from "@/widgets/admin-support-thread";

type AdminSupportThreadPageProps = {
  params: Promise<{ id: string }>;
};

/** Админка: одно обращение в поддержку с ответом. */
export default async function AdminSupportThreadPage({ params }: AdminSupportThreadPageProps) {
  const { id } = await params;

  return <AdminSupportThread threadId={Number(id)} />;
}
