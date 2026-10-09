"use client";

import { ADMIN_USERS_PATH } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import RatingLabel from "@/shared/ui/rating-label";
import Title from "@/shared/ui/title";
import AdminListings from "@/widgets/admin-listings";
import { useAdminUser } from "./model/use-admin-user";
import styles from "./style.module.scss";

type AdminUserProps = {
  userId: number;
};

/** Пользователь в админке: контакты, рейтинг и все его объявления с действиями. */
const AdminUser = ({ userId }: AdminUserProps) => {
  const { user, error } = useAdminUser(userId);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!user) return <Loader />;

  const name = user.name ?? "Без имени";

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[{ label: "Пользователи", href: ADMIN_USERS_PATH }, { label: name }]} />

      <div className={styles.profile}>
        <Avatar src={user.avatar_url} letter={name.charAt(0).toUpperCase()} size="lg" />

        <div className={styles.info}>
          <Title as="h1">{name}</Title>
          <p className={styles.line}>{user.email}</p>
          <p className={styles.line}>
            {[user.phone, user.city?.name, `на сайте с ${formatDate(user.created_at)}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <RatingLabel rating={user.rating} count={user.reviews_count} />
        </div>
      </div>

      <Title>Объявления</Title>
      <AdminListings ownerId={user.id} />
    </div>
  );
};

export default AdminUser;
