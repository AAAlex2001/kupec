import cn from "classnames";
import type { ComponentProps } from "react";
import { ListingCard } from "@/entities/listing";
import styles from "./style.module.scss";

type PreviewProps = {
  card: ComponentProps<typeof ListingCard>;
  plain?: boolean;
};

/** Блок «Так объявление увидят покупатели»: карточка на белой подложке внутри серой. plain — без подложек. */
const Preview = ({ card, plain }: PreviewProps) => (
  <div className={cn(styles.preview, plain && styles.plain)}>
    <p className={styles.title}>Так объявление увидят покупатели</p>
    <p className={styles.text}>Проверьте название, фото и цену перед публикацией.</p>

    <div className={styles.card}>
      <ListingCard {...card} />
    </div>
  </div>
);

export default Preview;
