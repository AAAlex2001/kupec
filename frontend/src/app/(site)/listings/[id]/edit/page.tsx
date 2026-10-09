import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryTree } from "@/entities/category/server";
import { getListing, getListingOptions } from "@/entities/listing/server";
import { getSessionUser, sessionHeaders } from "@/entities/user/server";
import ListingEditor from "@/widgets/listing-editor";

export const metadata: Metadata = {
  title: "Редактировать объявление",
  robots: { index: false, follow: false },
};

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

/** Правка объявления: автором или администратором. Остальным — 404. */
export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const headers = await sessionHeaders();
  if (!headers) notFound();

  const [user, listing, options, tree] = await Promise.all([
    getSessionUser(headers),
    getListing(Number(id), headers),
    getListingOptions(),
    getCategoryTree(),
  ]);

  if (!user || !listing) notFound();
  if (listing.owner.id !== user.id && !user.is_admin) notFound();

  return (
    <main>
      <ListingEditor options={options} tree={tree} listing={listing} />
    </main>
  );
}
