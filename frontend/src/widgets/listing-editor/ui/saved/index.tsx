import type { Listing } from "@/entities/listing";
import { MY_LISTINGS_PATH, listingPath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { CircleCheckIcon } from "@/shared/ui/icons";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type SavedProps = {
  listing: Listing;
  editing: boolean;
  onCreateAnother: () => void;
};

/** Заголовок итога: опубликовано, изменения сохранены или черновик сохранён. */
const savedTitle = (published: boolean, editing: boolean) => {
  if (!published) return "Черновик сохранён";

  return editing ? "Изменения сохранены" : "Объявление опубликовано";
};

/** Итог сохранения объявления и следующие шаги. */
const Saved = ({ listing, editing, onCreateAnother }: SavedProps) => {
  const published = listing.status === "published";

  return (
    <div className={styles.saved}>
      <CircleCheckIcon className={styles.icon} />

      <Title>{savedTitle(published, editing)}</Title>

      <p className={styles.text}>
        {listing.title}.{" "}
        {published
          ? "Объявление уже доступно в каталоге, покупатели могут написать вам на сайте."
          : "Он появится во вкладке «Черновики» в разделе «Мои объявления»."}
      </p>

      <div className={styles.buttons}>
        <Button href={MY_LISTINGS_PATH}>Мои объявления</Button>

        {editing ? (
          <Button variant="secondary" href={listingPath(listing.id)}>
            Открыть объявление
          </Button>
        ) : (
          <Button variant="secondary" onClick={onCreateAnother}>
            Разместить ещё
          </Button>
        )}
      </div>
    </div>
  );
};

export default Saved;
