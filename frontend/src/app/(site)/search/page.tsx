import type { Metadata } from "next";
import { getLocation } from "@/entities/city/server";
import { getListings } from "@/entities/listing/server";
import { filtersQuery, pickFilters } from "@/features/filter-listings";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { SEARCH_PATH } from "@/shared/config/routes";
import { OG_BASE, OG_COVERS } from "@/shared/lib/seo";
import SearchResults from "@/widgets/search-results";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Поиск",
  description: "Поиск товаров и услуг на «Купце»: найдите то, что вам нужно.",
  robots: { index: false, follow: true },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: "Поиск товаров и услуг",
    description: "Найдите то, что вам нужно, на «Купце».",
    url: SEARCH_PATH,
    images: [OG_COVERS.search],
  },
};

/** Поиск по объявлениям: запрос q и фильтры из адреса, первая порция — с сервера. */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = pickFilters(await searchParams);
  const city = await getLocation();
  const listings = await getListings({
    city: city?.id,
    filters: filtersQuery(filters),
    bounds: true,
    limit: FEED_PAGE_SIZE,
  });

  return (
    <main>
      <SearchResults city={city} filters={filters} listings={listings} />
    </main>
  );
}
