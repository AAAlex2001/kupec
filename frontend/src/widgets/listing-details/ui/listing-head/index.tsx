import type { Listing } from "@/entities/listing";
import { CATALOG_PATH, HOME_PATH } from "@/shared/config/routes";
import { formatDate, plural } from "@/shared/lib/format";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import styles from "./style.module.scss";

type ListingHeadProps = {
  listing: Listing;
};

const VIEWS: [string, string, string] = ["просмотр", "просмотра", "просмотров"];

/** Путь до объявления: «Главная / Категория / Название». */
const listingCrumbs = (listing: Listing) => {
  const crumbs = [{ label: "Главная", href: HOME_PATH }];

  if (listing.category) {
    crumbs.push({ label: listing.category.name, href: `${CATALOG_PATH}/${listing.category.slug}` });
  }

  return [...crumbs, { label: listing.title }];
};

/** Шапка объявления: путь, название, город, дата, просмотры и номер. */
const ListingHead = ({ listing }: ListingHeadProps) => (
  <div className={styles.head}>
    <Breadcrumbs items={listingCrumbs(listing)} />

    <h1 className={styles.title}>{listing.title}</h1>

    <div className={styles.meta}>
      {listing.city && <span className={styles.place}>{listing.city.name}</span>}
      {listing.published_at && <span>Опубликовано {formatDate(listing.published_at)}</span>}
      <span>
        {listing.views_count} {plural(listing.views_count, VIEWS)}
      </span>
      <span>№ {listing.id}</span>
    </div>
  </div>
);

export default ListingHead;
