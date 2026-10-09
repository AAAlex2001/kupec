import { catalogCrumbs } from "@/entities/category";
import type { Category, Listing } from "@/entities/listing";
import { formatDate, plural } from "@/shared/lib/format";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import styles from "./style.module.scss";

type ListingHeadProps = {
  listing: Listing;
  categories: Category[];
};

const VIEWS: [string, string, string] = ["просмотр", "просмотра", "просмотров"];

/** Шапка объявления: полный путь по каталогу, название, город, дата, просмотры и номер. */
const ListingHead = ({ listing, categories }: ListingHeadProps) => (
  <div className={styles.head}>
    <Breadcrumbs items={[...catalogCrumbs(categories), { label: listing.title }]} />

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
