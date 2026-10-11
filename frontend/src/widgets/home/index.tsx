import { CategoryTiles, type CategoryNode } from "@/entities/category";
import { LocationSummary, type City } from "@/entities/city";
import type { ListingPage } from "@/entities/listing";
import { HOME_PATH } from "@/shared/config/routes";
import ListingFeed from "@/widgets/listing-feed";
import styles from "./style.module.scss";

type HomeProps = {
  categories: CategoryNode[];
  city: City | null;
  latest: ListingPage;
  pageNumber: number;
};

/** Главная: плитки категорий и все объявления там, где ищет посетитель, постранично для поисковиков. */
const Home = ({ categories, city, latest, pageNumber }: HomeProps) => (
  <div className={styles.home}>
    <CategoryTiles categories={categories} ariaLabel="Категории" />
    <LocationSummary city={city} total={latest.total} />
    <ListingFeed
      key={city?.id ?? "country"}
      title="Все объявления"
      titleAs="h1"
      city={city}
      initial={latest}
      query={{ city: city?.id }}
      pageNumber={pageNumber}
      pagesPath={HOME_PATH}
    />
  </div>
);

export default Home;
