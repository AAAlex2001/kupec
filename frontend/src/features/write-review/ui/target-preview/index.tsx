import Image from "next/image";
import type { ReviewTarget } from "../../model/types";
import styles from "./style.module.scss";

type TargetPreviewProps = {
  target: ReviewTarget;
};

/** Объявление в шапке формы отзыва: фото, название и продавец. */
const TargetPreview = ({ target }: TargetPreviewProps) => (
  <div className={styles.target}>
    <div className={styles.photo}>
      {target.coverUrl && (
        <Image className={styles.image} src={target.coverUrl} alt="" fill sizes="64px" unoptimized />
      )}
    </div>

    <div className={styles.info}>
      <p className={styles.title}>{target.title}</p>
      {target.subtitle && <p className={styles.subtitle}>{target.subtitle}</p>}
    </div>
  </div>
);

export default TargetPreview;
