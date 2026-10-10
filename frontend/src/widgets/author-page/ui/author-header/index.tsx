"use client";

import { useUser, type PublicUser } from "@/entities/user";
import { FollowButton } from "@/features/follow-author";
import { formatDate } from "@/shared/lib/format";
import Avatar from "@/shared/ui/avatar";
import RatingLabel from "@/shared/ui/rating-label";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type AuthorHeaderProps = {
  author: PublicUser;
};

/** Шапка страницы автора: аватар, имя, город, на сайте с какого дня, рейтинг и подписка. Гостю подписка — после входа. */
const AuthorHeader = ({ author }: AuthorHeaderProps) => {
  const { user } = useUser();
  const name = author.name ?? "Пользователь";
  const place = author.city ? `${author.city.name} · ` : "";

  return (
    <div className={styles.header}>
      <Avatar src={author.avatar_url} letter={name[0]} size="lg" />

      <div className={styles.info}>
        <Title as="h1">{name}</Title>
        <p className={styles.meta}>
          {place}На сайте с {formatDate(author.created_at)}
        </p>
        <RatingLabel rating={author.rating} count={author.reviews_count} />
      </div>

      {user?.id !== author.id && <FollowButton authorId={author.id} following={author.following} />}
    </div>
  );
};

export default AuthorHeader;
