import { getListings } from "@/entities/listing/server";
import { FEED_PAGE_SIZE, FEED_STRIP_SIZE } from "@/shared/config/feed";
import HomeFeed from "@/widgets/home-feed";

/** Главная: подборки услуг и товаров и лента всех объявлений, первая порция — с сервера. */
export default async function HomePage() {
  const [services, products, latest] = await Promise.all([
    getListings({ kind: "service", limit: FEED_STRIP_SIZE }),
    getListings({ kind: "product", limit: FEED_STRIP_SIZE }),
    getListings({ limit: FEED_PAGE_SIZE }),
  ]);

  return (
    <main>
      <HomeFeed services={services} products={products} latest={latest} />
    </main>
  );
}
