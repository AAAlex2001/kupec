import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCategoryPage } from "@/entities/category/server";
import { getLocation } from "@/entities/city/server";
import { getListingOptions, getListings } from "@/entities/listing/server";
import { filtersQuery, pickFilters } from "@/features/filter-listings";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import CategoryCatalog from "@/widgets/category-catalog";

type CatalogPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Категория по адресу. Один запрос на страницу. */
const loadCategory = cache((slug: string) => getCategoryPage(slug));

/** Название категории во вкладке браузера. */
export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const page = await loadCategory((await params).slug);

  return { title: page?.category.name ?? "Категория не найдена" };
}

/** Каталог категории: подкатегории, фильтры из адреса и первая порция объявлений. */
export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { slug } = await params;
  const filters = pickFilters(await searchParams);

  const [page, city] = await Promise.all([loadCategory(slug), getLocation()]);
  if (!page) notFound();

  const [listings, options] = await Promise.all([
    getListings({
      category: slug,
      city: city?.id,
      filters: filtersQuery(filters),
      bounds: true,
      limit: FEED_PAGE_SIZE,
    }),
    page.category.kind === "service" ? getListingOptions() : null,
  ]);

  return (
    <main>
      <CategoryCatalog
        page={page}
        city={city}
        filters={filters}
        places={options?.service_places ?? []}
        listings={listings}
      />
    </main>
  );
}
