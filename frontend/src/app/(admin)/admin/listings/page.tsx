import Title from "@/shared/ui/title";
import AdminListings from "@/widgets/admin-listings";

/** Админка: объявления всех пользователей. */
export default function AdminListingsPage() {
  return (
    <>
      <Title as="h1">Объявления</Title>
      <AdminListings />
    </>
  );
}
