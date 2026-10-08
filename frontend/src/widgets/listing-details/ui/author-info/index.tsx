import type { ListingAuthor } from "@/entities/listing";
import Avatar from "@/shared/ui/avatar";
import styles from "./style.module.scss";

type AuthorInfoProps = {
  author: ListingAuthor;
};

/** Автор объявления: аватар, имя и с какого года на сайте. */
const AuthorInfo = ({ author }: AuthorInfoProps) => {
  const name = author.name ?? "Пользователь";
  const since = new Date(author.created_at).getFullYear();

  return (
    <div className={styles.author}>
      <Avatar src={author.avatar_url} letter={name.charAt(0).toUpperCase()} />

      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.since}>Частное лицо · на сайте с {since} года</p>
      </div>
    </div>
  );
};

export default AuthorInfo;
