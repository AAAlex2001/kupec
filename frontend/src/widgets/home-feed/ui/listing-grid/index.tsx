import type { ListingPage } from "@/entities/listing";
import Button from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";
import FeedCard from "@/widgets/feed-card";
import styles from "./style.module.scss";

type ListingGridProps = {
  title: string;
  page: ListingPage;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

/** Сетка объявлений с «Показать ещё». Пока грузится — крутилка. */
const ListingGrid = ({ title, page, loading, loadingMore, onLoadMore }: ListingGridProps) => (
  <section className={styles.section}>
    <h2 className={styles.title}>{title}</h2>

    {loading && <Loader />}

    {!loading && (
      <div className={styles.grid}>
        {page.items.map((listing) => (
          <FeedCard key={listing.id} listing={listing} />
        ))}
      </div>
    )}

    {!loading && page.items.length < page.total && (
      <Button className={styles.more} variant="secondary" loading={loadingMore} onClick={onLoadMore}>
        Показать ещё
      </Button>
    )}
  </section>
);

export default ListingGrid;
