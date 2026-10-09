import Link from "next/link";
import { formatDate, plural } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import RatingLabel from "@/shared/ui/rating-label";
import type { AdminUser } from "../../model/types";
import styles from "./style.module.scss";

type UserRowProps = {
  user: AdminUser;
  href: string;
};

const LISTINGS: [string, string, string] = ["объявление", "объявления", "объявлений"];

/** Пользователь строкой в админке: аватар, имя, почта, город, объявления и рейтинг. */
const UserRow = ({ user, href }: UserRowProps) => {
  const name = user.name ?? "Без имени";

  return (
    <Link className={styles.row} href={href}>
      <Avatar src={user.avatar_url} letter={name.charAt(0).toUpperCase()} />

      <div className={styles.person}>
        <p className={styles.name}>
          {name}
          {user.is_admin && <span className={styles.admin}>админ</span>}
        </p>
        <p className={styles.email}>{user.email}</p>
      </div>

      <div className={styles.stats}>
        <span>{user.city?.name ?? "Город не указан"}</span>
        <span>
          {user.listings_count} {plural(user.listings_count, LISTINGS)}
        </span>
        <RatingLabel rating={user.rating} count={user.reviews_count} />
        <span>с {formatDate(user.created_at)}</span>
      </div>
    </Link>
  );
};

export default UserRow;
