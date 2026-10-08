"use client";

import type { ListingPage } from "@/entities/listing";
import { PublishButton } from "@/features/publish-listing";
import { POPULAR_CATEGORIES } from "@/shared/config/navigation";
import { plural } from "@/shared/lib/format";
import Chips from "@/shared/ui/chips";
import EmptyState from "@/shared/ui/empty-state";
import { MapPinIcon, RowsIcon } from "@/shared/ui/icons";
import Notice from "@/shared/ui/notice";
import { useFeed } from "./model/use-feed";
import ListingGrid from "./ui/listing-grid";
import ListingStrip from "./ui/listing-strip";
import styles from "./style.module.scss";

type HomeFeedProps = {
  services: ListingPage;
  products: ListingPage;
  latest: ListingPage;
};

const ALL = "all";

const CHIPS = [
  { value: ALL, label: "Все" },
  ...POPULAR_CATEGORIES.map(({ slug, label }) => ({ value: slug, label })),
];

const LISTINGS: [string, string, string] = ["объявление", "объявления", "объявлений"];

/** Лента главной: регион и категории сверху, подборки услуг и товаров, затем все объявления. */
const HomeFeed = ({ services, products, latest }: HomeFeedProps) => {
  const { category, page, loading, loadingMore, error, select, loadMore } = useFeed(latest);
  const chip = CHIPS.find((item) => item.value === category);

  if (latest.total === 0) {
    return (
      <div className={styles.feed}>
        <EmptyState
          icon={<RowsIcon />}
          title="Объявлений пока нет"
          text="Станьте первым: разместите товар или услугу — это бесплатно."
          action={<PublishButton>Разместить объявление</PublishButton>}
        />
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <div className={styles.filters}>
        <p className={styles.region}>
          <MapPinIcon className={styles.pin} />
          <span className={styles.regionName}>Иркутская область</span>
          <span aria-hidden="true">·</span>
          <span>
            {latest.total} {plural(latest.total, LISTINGS)}
          </span>
        </p>

        <Chips
          ariaLabel="Категории"
          value={category ?? ALL}
          options={CHIPS}
          onChange={(value) => select(value === ALL ? null : value)}
        />
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {category === null && services.items.length > 0 && (
        <ListingStrip title="Массаж и репетиторы" listings={services.items} />
      )}

      {category === null && products.items.length > 0 && (
        <ListingStrip title="Грибы, ягоды и соленья" listings={products.items} />
      )}

      <ListingGrid
        title={chip && category ? chip.label : "Ещё объявления"}
        page={page}
        loading={loading}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default HomeFeed;
