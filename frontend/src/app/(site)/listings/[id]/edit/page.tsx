import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

/** Правка своего объявления. Чужое или несуществующее — 404. */
export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const headers = await sessionHeaders();
  if (!headers) notFound();

  const [user, listing, options] = await Promise.all([
    getSessionUser(headers),
    getListing(Number(id), headers),
    getListingOptions(),
  ]);

  if (!user || !listing || listing.owner.id !== user.id) notFound();

  return (
    <main>
      <ListingEditor options={options} listing={listing} />
    </main>
  );
}
