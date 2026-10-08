import Image from "next/image";
import { MaximizeIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type GalleryPhotoProps = {
  src: string;
  onOpen: () => void;
};

/** Большое фото в галерее. Клик открывает его на весь экран. */
const GalleryPhoto = ({ src, onOpen }: GalleryPhotoProps) => (
  <button
    type="button"
    className={`keen-slider__slide ${styles.photo}`}
    aria-label="Открыть фото на весь экран"
    onClick={onOpen}
  >
    <Image className={styles.image} src={src} alt="" fill sizes="900px" unoptimized />
    <MaximizeIcon className={styles.zoom} />
  </button>
);

export default GalleryPhoto;
