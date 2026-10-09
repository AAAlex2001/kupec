import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/entities/listing";
import { categoryPath } from "@/shared/config/routes";
import styles from "./style.module.scss";

type CategoryTilesProps = {
  categories: Category[];
  ariaLabel: string;
};

/** Плитки категорий, как на Авито: название и картинка в углу. По нажатию — каталог категории. */
const CategoryTiles = ({ categories, ariaLabel }: CategoryTilesProps) => (
  <nav className={styles.tiles} aria-label={ariaLabel}>
    {categories.map((category) => (
      <Link key={category.id} className={styles.tile} href={categoryPath(category.slug)}>
        <span className={styles.name}>{category.name}</span>

        {category.image_url && (
          <Image
            className={styles.image}
            src={category.image_url}
            alt=""
            width={144}
            height={80}
            unoptimized
          />
        )}
      </Link>
    ))}
  </nav>
);

export default CategoryTiles;
