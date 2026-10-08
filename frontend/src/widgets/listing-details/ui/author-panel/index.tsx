import type { Listing } from "@/entities/listing";
import { WriteButton } from "@/features/start-chat";
import { PhoneButton } from "@/features/show-phone";
import { FavoriteWideButton } from "@/features/toggle-favorite";
import { formatRub } from "@/shared/lib/format";
import Notice from "@/shared/ui/notice";
import AuthorInfo from "../author-info";
import styles from "./style.module.scss";

type AuthorPanelProps = {
  listing: Listing;
};

/** Где оказывают услугу или как получить товар: «У специалиста · Онлайн», «Самовывоз». */
const conditions = (listing: Listing) =>
  listing.kind === "service" ? listing.service_place_labels.join(" · ") : "Самовывоз";

/** Панель справа: цена, условия, автор и кнопки связи. */
const AuthorPanel = ({ listing }: AuthorPanelProps) => (
  <aside className={styles.aside}>
    <div className={styles.panel}>
      {listing.price && (
        <p className={styles.price}>
          {formatRub(listing.price)}
          {listing.unit_label && <span className={styles.unit}>/ {listing.unit_label}</span>}
        </p>
      )}

      <span className={styles.chip}>{conditions(listing)}</span>

      <AuthorInfo author={listing.owner} />

      <div className={styles.actions}>
        <WriteButton
          listingId={listing.id}
          ownerId={listing.owner.id}
          label="Написать на сайте"
          variant="primary"
        />
        <FavoriteWideButton listingId={listing.id} />
        {listing.contact_phone && <PhoneButton phone={listing.contact_phone} />}
      </div>

      <p className={styles.note}>
        О времени, месте встречи и оплате договаривайтесь с автором в сообщениях.
      </p>
    </div>

    <Notice tone="info">
      Не переводите предоплату незнакомым людям. Обсудите условия и проверьте предложение при
      встрече.
    </Notice>
  </aside>
);

export default AuthorPanel;
