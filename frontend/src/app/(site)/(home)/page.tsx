import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryTree } from "@/entities/category/server";
import { getLocation } from "@/entities/city/server";
import { getListings } from "@/entities/listing/server";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { HOME_PATH } from "@/shared/config/routes";
import { pageNumberFrom, pagePath } from "@/shared/lib/pagination";
import Home from "@/widgets/home";

type HomePageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Адрес главной: у страниц ленты дальше первой — свой адрес и заголовок. */
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const canonical = { alternates: { canonical: pagePath(HOME_PATH, pageNumber) } };
  if (pageNumber === 1) return canonical;

  return { ...canonical, title: `Все объявления — страница ${pageNumber}` };
}

/** Главная: категории и страница объявлений там, где ищет посетитель, — с сервера. Пустая страница после последней — 404. */
export default async function HomePage({ searchParams }: HomePageProps) {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const city = await getLocation();
  const [categories, latest] = await Promise.all([
    getCategoryTree(),
    getListings({ city: city?.id, limit: FEED_PAGE_SIZE, offset: (pageNumber - 1) * FEED_PAGE_SIZE }),
  ]);
  if (pageNumber > 1 && latest.items.length === 0) notFound();

  return (
    <main>
      <Home categories={categories} city={city} latest={latest} pageNumber={pageNumber} />
    </main>
  );
}
