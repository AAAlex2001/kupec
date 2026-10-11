"use client";

import type { City } from "@/entities/city";
import type { ListingPage } from "@/entities/listing";
import { ChangeLocationButton } from "@/features/choose-location";
import { PublishButton } from "@/features/publish-listing";
import { FEED_PAGE_SIZE } from "@/shared/config/feed";
import { offsetPath } from "@/shared/lib/pagination";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { BasketIcon, PlusIcon, SearchIcon } from "@/shared/ui/icons";
import LoadMore from "@/shared/ui/load-more";
import Notice from "@/shared/ui/notice";
import FeedCard from "@/widgets/feed-card";
import { useListingFeed, type FeedQuery } from "./model/use-listing-feed";
import styles from "./style.module.scss";

type ListingFeedProps = {
  title?: string;
  titleAs?: "h1" | "h2";
  city: City | null;
  initial: ListingPage;
  query: FeedQuery;
  pageNumber?: number;
  pagesPath?: string;
};

/** Сетка объявлений с «Показать ещё». Пусто — подсказка сменить фильтры, регион или разместить первое объявление.
 *
 * pagesPath — адрес раздела с постраничными ссылками ?page=: тогда «Показать ещё» — ссылка для поисковиков.
 */
const ListingFeed = ({
  title,
  titleAs: Heading = "h2",
  city,
  initial,
  query,
  pageNumber = 1,
  pagesPath,
}: ListingFeedProps) => {
  const feed = useListingFeed(initial, query, (pageNumber - 1) * FEED_PAGE_SIZE);
  const { page, loadingMore, error, loadMore } = feed;

  if (page.total === 0 && query.filters) {
    return (
      <EmptyState
        icon={<SearchIcon />}
        title="Ничего не нашлось"
        text="Попробуйте изменить запрос или сбросить фильтры."
      />
    );
  }

  if (page.total === 0) {
    return (
      <EmptyState
        icon={<BasketIcon />}
        title="Объявлений пока нет"
        text="Станьте первым: разместите товар или услугу — это бесплатно."
        action={
          <div className={styles.actions}>
            <PublishButton>
              <PlusIcon />
              Разместить объявление
            </PublishButton>
            <ChangeLocationButton city={city} />
          </div>
        }
      />
    );
  }

  return (
    <section className={styles.feed}>
      {title && <Heading className={styles.title}>{title}</Heading>}

      <div className={styles.grid}>
        {page.items.map((listing) => (
          <FeedCard key={listing.id} listing={listing} />
        ))}
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {feed.hasMore && pagesPath && (
        <LoadMore
          className={styles.more}
          variant="secondary"
          href={offsetPath(pagesPath, feed.next, FEED_PAGE_SIZE)}
          loading={loadingMore}
          onLoad={loadMore}
        >
          Показать ещё
        </LoadMore>
      )}
      {feed.hasMore && !pagesPath && (
        <Button className={styles.more} variant="secondary" loading={loadingMore} onClick={loadMore}>
          Показать ещё
        </Button>
      )}
    </section>
  );
};

export default ListingFeed;
