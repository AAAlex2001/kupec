import { LocationSummary, type City } from "@/entities/city";
import type { ListingPage } from "@/entities/listing";
import type { Filters } from "@/features/filter-listings";
import { HOME_PATH } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Title from "@/shared/ui/title";
import ListingCatalog from "@/widgets/listing-catalog";
import styles from "./style.module.scss";

type SearchResultsProps = {
  city: City | null;
  filters: Filters;
  listings: ListingPage;
};

/** Результаты поиска из шапки: запрос, сколько нашли и объявления с фильтрами. */
const SearchResults = ({ city, filters, listings }: SearchResultsProps) => {
  const title = filters.q ? `«${filters.q}»` : "Все объявления";

  return (
    <div className={styles.search}>
      <div className={styles.head}>
        <Breadcrumbs items={[{ label: "Главная", href: HOME_PATH }, { label: "Поиск" }]} />
        <Title as="h1">{title}</Title>
        <LocationSummary city={city} total={listings.total} />
      </div>

      <ListingCatalog
        city={city}
        filters={filters}
        fields={[]}
        places={[]}
        showKind
        listings={listings}
      />
    </div>
  );
};

export default SearchResults;
