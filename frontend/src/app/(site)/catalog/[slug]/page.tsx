import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCategoryPage } from "@/entities/category/server";
import { getLocation } from "@/entities/city/server";
import { getListingOptions, getListings } from "@/entities/listing/server";
import { filtersQuery, pickFilters } from "@/features/filter-listings";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { categoryPath } from "@/shared/config/routes";
import { pageNumberFrom, pagePath } from "@/shared/lib/pagination";
import { OG_BASE, ogImages } from "@/shared/lib/seo";
import CategoryCatalog from "@/widgets/category-catalog";

type CatalogPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Категория по адресу. Один запрос на страницу. */
const loadCategory = cache((slug: string) => getCategoryPage(slug));

/** Название, описание и картинка категории. Адрес страницы — без фильтров, чтобы поисковик не плодил копии. */
export async function generateMetadata({ params, searchParams }: CatalogPageProps): Promise<Metadata> {
  const page = await loadCategory((await params).slug);
  if (!page) return { title: "Категория не найдена", robots: { index: false } };

  const { category } = page;
  const pageNumber = pageNumberFrom((await searchParams).page);
  const path = pagePath(categoryPath(category.slug), pageNumber);
  const title = pageNumber > 1 ? `${category.name} — страница ${pageNumber}` : category.name;
  const description = `${category.name} по всей России: объявления от частных продавцов и мастеров на «Купце».`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OG_BASE,
      type: "website",
      title,
      description,
      url: path,
      images: ogImages(category.image_url),
    },
  };
}

/** Каталог категории: подкатегории, фильтры из адреса и первая порция объявлений. */
export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const filters = pickFilters(query);
  const pageNumber = pageNumberFrom(query.page);

  const [page, city] = await Promise.all([loadCategory(slug), getLocation()]);
  if (!page) notFound();

  const [listings, options] = await Promise.all([
    getListings({
      category: slug,
      city: city?.id,
      filters: filtersQuery(filters),
      bounds: true,
      limit: FEED_PAGE_SIZE,
      offset: (pageNumber - 1) * FEED_PAGE_SIZE,
    }),
    page.category.kind === "service" ? getListingOptions() : null,
  ]);
  if (pageNumber > 1 && listings.items.length === 0) notFound();

  return (
    <main>
      <CategoryCatalog
        page={page}
        city={city}
        filters={filters}
        places={options?.service_places ?? []}
        listings={listings}
        pageNumber={pageNumber}
      />
    </main>
  );
}
