import { catalogCrumbs, CategoryTiles, type CategoryPage } from "@/entities/category";
import { LocationSummary, type City } from "@/entities/city";
import type { ListingPage, Option } from "@/entities/listing";
import type { Filters } from "@/features/filter-listings";
import { categoryPath } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Title from "@/shared/ui/title";
import ListingCatalog from "@/widgets/listing-catalog";
import styles from "./style.module.scss";

type CategoryCatalogProps = {
  page: CategoryPage;
  city: City | null;
  filters: Filters;
  places: Option[];
  listings: ListingPage;
  pageNumber: number;
};

/** Каталог категории: путь, подкатегории плитками и объявления всей ветки с фильтрами, постранично для поисковиков. */
const CategoryCatalog = ({ page, city, filters, places, listings, pageNumber }: CategoryCatalogProps) => {
  const { category, parents, children, fields } = page;

  return (
    <div className={styles.catalog}>
      <div className={styles.head}>
        <Breadcrumbs items={[...catalogCrumbs(parents), { label: category.name }]} />
        <Title as="h1">{category.name}</Title>
        <LocationSummary city={city} total={listings.total} />
      </div>

      {children.length > 0 && <CategoryTiles categories={children} ariaLabel="Подкатегории" />}

      <ListingCatalog
        category={category.slug}
        city={city}
        filters={filters}
        fields={fields}
        places={places}
        showKind={false}
        listings={listings}
        pageNumber={pageNumber}
        pagesPath={categoryPath(category.slug)}
      />
    </div>
  );
};

export default CategoryCatalog;
