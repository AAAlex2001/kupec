import Image from "next/image";
import type { ReactNode } from "react";
import { formatDate, formatRub, plural } from "@/shared/lib/format";
import { EyeIcon } from "@/shared/ui/icons";
import type { Listing } from "../../model/types";
import styles from "./style.module.scss";

type ListingRowProps = {
  listing: Listing;
  actions: ReactNode;
};

const VIEWS: [string, string, string] = ["просмотр", "просмотра", "просмотров"];

/** Объявление в списке «Мои объявления»: фото, название, цена, просмотры, дата и действия. */
const ListingRow = ({ listing, actions }: ListingRowProps) => {
  const cover = listing.photos[0];

  return (
    <article className={styles.row}>
      <div className={styles.photo}>
        {cover && (
          <Image className={styles.image} src={cover.url} alt="" fill sizes="132px" unoptimized />
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{listing.title}</p>

        <p className={styles.price}>
          {listing.price ? formatRub(listing.price) : "Цена не указана"}
          {listing.price && listing.unit_label && ` / ${listing.unit_label}`}
        </p>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <EyeIcon />
            {listing.views_count} {plural(listing.views_count, VIEWS)}
          </span>
          <span className={styles.stat}>{formatDate(listing.published_at ?? listing.updated_at)}</span>
        </div>
      </div>

      <div className={styles.actions}>{actions}</div>
    </article>
  );
};

export default ListingRow;
