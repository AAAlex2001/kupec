import type { ComponentProps } from "react";
import { ListingCard } from "@/entities/listing";
import styles from "./style.module.scss";

type PreviewProps = {
  card: ComponentProps<typeof ListingCard>;
};

/** Блок «Так объявление увидят покупатели» с карточкой из текущих полей формы. */
const Preview = ({ card }: PreviewProps) => (
  <div className={styles.preview}>
    <p className={styles.title}>Так объявление увидят покупатели</p>
    <p className={styles.text}>Проверьте название, фото и цену перед публикацией.</p>
    <ListingCard {...card} />
  </div>
);

export default Preview;
