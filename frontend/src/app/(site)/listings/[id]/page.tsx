import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCategoryPage } from "@/entities/category/server";
import { listingCover, listingDescription } from "@/entities/listing";
import { getListing, getListings, getSimilarListings } from "@/entities/listing/server";
import { getSellerReviews } from "@/entities/review/server";
import { sessionHeaders } from "@/entities/user/server";
import { listingPath } from "@/shared/config/routes";
import { OG_BASE, ogImages } from "@/shared/lib/seo";
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

/** Заголовок, описание, фото для превью ссылки и адрес страницы. Неопубликованное не индексируется. */
export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await loadListing(Number((await params).id));
  if (!listing) return { title: "Объявление не найдено", robots: { index: false } };

  const description = listingDescription(listing);
  const cover = listingCover(listing);

  return {
    title: listing.title,
    description,
    alternates: { canonical: listingPath(listing.id) },
    robots: { index: listing.status === "published" },
    openGraph: {
      ...OG_BASE,
      type: "website",
      title: listing.title,
      description,
      url: listingPath(listing.id),
      images: ogImages(cover),
    },
  };
}

/** Страница объявления с путём по каталогу и подборками «Ещё от продавца» и «Похожие». */
export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await loadListing(Number((await params).id));
  if (!listing) notFound();

  const [{ categories, fields }, sellerListings, sellerReviews] = await Promise.all([
    loadCategory(listing.category?.slug),
    getListings({ owner: listing.owner.id, exclude: listing.id, limit: RELATED_LIMIT }),
    getSellerReviews(listing.owner.id),
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
        sellerReviews={sellerReviews}
      />
    </main>
  );
}
