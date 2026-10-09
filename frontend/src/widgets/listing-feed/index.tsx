"use client";

import type { ListingPage } from "@/entities/listing";
import { PublishButton } from "@/features/publish-listing";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { BasketIcon, SearchIcon } from "@/shared/ui/icons";
import Notice from "@/shared/ui/notice";
import FeedCard from "@/widgets/feed-card";
import { useListingFeed, type FeedQuery } from "./model/use-listing-feed";
import styles from "./style.module.scss";

type ListingFeedProps = {
  title?: string;
  initial: ListingPage;
  query: FeedQuery;
};

/** Сетка объявлений с «Показать ещё». Пусто — подсказка сменить фильтры или разместить первое объявление. */
const ListingFeed = ({ title, initial, query }: ListingFeedProps) => {
  const { page, loadingMore, error, loadMore } = useListingFeed(initial, query);

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
        action={<PublishButton>Разместить объявление</PublishButton>}
      />
    );
  }

  return (
    <section className={styles.feed}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={styles.grid}>
        {page.items.map((listing) => (
          <FeedCard key={listing.id} listing={listing} />
        ))}
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {page.items.length < page.total && (
        <Button className={styles.more} variant="secondary" loading={loadingMore} onClick={loadMore}>
          Показать ещё
        </Button>
      )}
    </section>
  );
};

export default ListingFeed;
