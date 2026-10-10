import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { listingPath } from "@/shared/config/routes";
import { BasketIcon } from "@/shared/ui/icons";
import { listingMeta, listingPrice } from "../../lib/listing";
import type { AttachedListing } from "../../model/types";
import styles from "./style.module.scss";

type PostListingProps = {
  listing: AttachedListing;
  action?: ReactNode;
};

/** Объявление в посте: подпись, фото, название ссылкой и цена. action — кнопка в углу, например «Убрать». */
const PostListing = ({ listing, action }: PostListingProps) => (
  <div className={styles.attachment}>
    <p className={styles.meta}>
      <BasketIcon />
      {listingMeta(listing)}
    </p>

    <Link className={styles.listing} href={listingPath(listing.id)}>
      <span className={styles.photo}>
        {listing.cover_url && (
          <Image className={styles.image} src={listing.cover_url} alt="" fill sizes="132px" unoptimized />
        )}
      </span>
      <span className={styles.info}>
        <span className={styles.title}>{listing.title}</span>
        <span className={styles.price}>{listingPrice(listing)}</span>
      </span>
    </Link>

    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export default PostListing;
