import type { CategoryField } from "@/entities/attribute";
import type { City } from "@/entities/city";
import type { ListingPage, Option } from "@/entities/listing";
import {
  CatalogFilters,
  filtersQuery,
  FiltersButton,
  SortSelect,
  type Filters,
} from "@/features/filter-listings";
import ListingFeed from "@/widgets/listing-feed";
import styles from "./style.module.scss";

type ListingCatalogProps = {
  category?: string;
  city: City | null;
  filters: Filters;
  fields: CategoryField[];
  places: Option[];
  showKind: boolean;
  listings: ListingPage;
  pageNumber?: number;
  pagesPath?: string;
};

/** Объявления с фильтрами: на ПК панель слева, до ПК — кнопка «Фильтры». Сверху порядок ленты. */
const ListingCatalog = ({
  category,
  city,
  filters,
  fields,
  places,
  showKind,
  listings,
  pageNumber,
  pagesPath,
}: ListingCatalogProps) => {
  const query = filtersQuery(filters);
  const panel = { filters, fields, places, showKind, ranges: listings.ranges ?? {} };
  const count = Object.keys(filters).filter((key) => key !== "q" && key !== "sort").length;

  return (
    <div className={styles.catalog}>
      <aside className={styles.aside}>
        <CatalogFilters key={query} {...panel} />
      </aside>

      <div className={styles.main}>
        <div className={styles.toolbar}>
          <FiltersButton key={query} count={count} {...panel} />
          <SortSelect filters={filters} />
        </div>

        <ListingFeed
          key={`${category}-${city?.id}-${query}`}
          city={city}
          initial={listings}
          query={{ category, city: city?.id, filters: query }}
          pageNumber={pageNumber}
          pagesPath={pagesPath}
        />
      </div>
    </div>
  );
};

export default ListingCatalog;
