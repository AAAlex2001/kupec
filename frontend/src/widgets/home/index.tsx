import { CategoryTiles, type CategoryNode } from "@/entities/category";
import { LocationSummary, type City } from "@/entities/city";
import type { ListingPage } from "@/entities/listing";
import ListingFeed from "@/widgets/listing-feed";
import styles from "./style.module.scss";

type HomeProps = {
  categories: CategoryNode[];
  city: City | null;
  latest: ListingPage;
};

/** Главная: плитки категорий и все объявления там, где ищет посетитель. */
const Home = ({ categories, city, latest }: HomeProps) => (
  <div className={styles.home}>
    <CategoryTiles categories={categories} ariaLabel="Категории" />
    <LocationSummary city={city} total={latest.total} />
    <ListingFeed
      key={city?.id ?? "country"}
      title="Все объявления"
      city={city}
      initial={latest}
      query={{ city: city?.id }}
    />
  </div>
);

export default Home;
