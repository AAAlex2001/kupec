import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getListing, getListings } from "@/entities/listing/server";
import { sessionHeaders } from "@/entities/user/server";
import ListingDetails from "@/widgets/listing-details";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

const RELATED_LIMIT = 10;

/** Объявление с cookie: автор видит и свой черновик. Один запрос на страницу. */
const loadListing = cache(async (id: number) => {
  const headers = await sessionHeaders();

  return getListing(id, headers ?? undefined);
});

/** Название объявления во вкладке браузера. */
export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await loadListing(Number((await params).id));

  return { title: listing?.title ?? "Объявление не найдено" };
}

/** Страница объявления с подборками «Ещё от продавца» и «Похожие». */
export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await loadListing(Number((await params).id));
  if (!listing) notFound();

  const [sellerListings, similarListings] = await Promise.all([
    getListings({ owner: listing.owner.id, exclude: listing.id, limit: RELATED_LIMIT }),
    getListings({ category: listing.category?.slug, exclude: listing.id, limit: RELATED_LIMIT }),
  ]);

  return (
    <main>
      <ListingDetails
        listing={listing}
        sellerListings={sellerListings.items}
        similarListings={similarListings.items}
      />
    </main>
  );
}
