import type { Metadata } from "next";
import { getCategoryTree } from "@/entities/category/server";
import { getLocation } from "@/entities/city/server";
import { getListings } from "@/entities/listing/server";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { HOME_PATH } from "@/shared/config/routes";
import Home from "@/widgets/home";

export const metadata: Metadata = {
  alternates: { canonical: HOME_PATH },
};

/** Главная: категории и первая порция объявлений там, где ищет посетитель, — с сервера. */
export default async function HomePage() {
  const city = await getLocation();
  const [categories, latest] = await Promise.all([
    getCategoryTree(),
    getListings({ city: city?.id, limit: FEED_PAGE_SIZE }),
  ]);

  return (
    <main>
      <Home categories={categories} city={city} latest={latest} />
    </main>
  );
}
