import cn from "classnames";
import Image from "next/image";
import styles from "./style.module.scss";

type GalleryThumbsProps = {
  photos: string[];
  current: number;
  onSelect: (index: number) => void;
};

/** Миниатюры под большим фото. Текущая обведена. */
const GalleryThumbs = ({ photos, current, onSelect }: GalleryThumbsProps) => (
  <div className={styles.thumbs}>
    {photos.map((src, index) => (
      <button
        key={src}
        type="button"
        className={cn(styles.thumb, index === current && styles.active)}
        aria-label={`Фото ${index + 1}`}
        aria-current={index === current}
        onClick={() => onSelect(index)}
      >
        <Image className={styles.image} src={src} alt="" fill sizes="120px" unoptimized />
      </button>
    ))}
  </div>
);

export default GalleryThumbs;
