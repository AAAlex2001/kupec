import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCategoryPage } from "@/entities/category/server";
import { getListing, getListings, getSimilarListings } from "@/entities/listing/server";
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

/** Категория объявления: путь по каталогу от раздела до неё и её атрибуты. */
const loadCategory = async (slug: string | undefined) => {
  const page = slug ? await getCategoryPage(slug) : null;

  return {
    categories: page ? [...page.parents, page.category] : [],
    fields: page?.fields ?? [],
  };
};

/** Название объявления во вкладке браузера. */
export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await loadListing(Number((await params).id));

  return { title: listing?.title ?? "Объявление не найдено" };
}

/** Страница объявления с путём по каталогу и подборками «Ещё от продавца» и «Похожие». */
export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await loadListing(Number((await params).id));
  if (!listing) notFound();

  const [{ categories, fields }, sellerListings] = await Promise.all([
    loadCategory(listing.category?.slug),
    getListings({ owner: listing.owner.id, exclude: listing.id, limit: RELATED_LIMIT }),
  ]);
  const narrowFirst = categories.map((category) => category.slug).reverse();
  const similarListings = await getSimilarListings(narrowFirst, listing.id, RELATED_LIMIT);

  return (
    <main>
      <ListingDetails
        listing={listing}
        categories={categories}
        fields={fields}
        sellerListings={sellerListings.items}
        similarListings={similarListings}
      />
    </main>
  );
}
