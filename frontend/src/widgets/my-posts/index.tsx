"use client";

import { useState } from "react";
import { fetchMyPosts, useMyPostCounts, type PostStatus } from "@/entities/post";
import { NEW_POST_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import PostList from "@/widgets/post-list";
import { TAB_HINTS, TABS } from "./data";
import PostsProfile from "./ui/posts-profile";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Раздел «Мои публикации»: профиль со счётчиками, вкладки «Публикации» и «Черновики» и посты.
 *
 * Список пересоздаётся на каждой вкладке, поэтому при переключении сразу виден лоадер.
 */
const MyPosts = () => {
  const [status, setStatus] = useState<PostStatus>("published");
  const [version, setVersion] = useState(0);
  const counts = useMyPostCounts(version);

  return (
    <div className={styles.posts}>
      <div className={styles.head}>
        <Title as="h1">Мои публикации</Title>
        <Button href={NEW_POST_PATH}>Написать пост</Button>
      </div>

      <PostsProfile counts={counts} />

      <Tabs
        ariaLabel="Публикации и черновики"
        value={status}
        tabs={TABS}
        onChange={(value) => setStatus(value as PostStatus)}
      />

      <p className={styles.hint}>{TAB_HINTS[status]}</p>

      <PostList
        key={status}
        load={(offset) => fetchMyPosts(status, PAGE_SIZE, offset)}
        emptyTitle="Здесь пока пусто"
        emptyText="Расскажите о себе, своих товарах и услугах: текст, фото, видео и объявления."
        emptyAction={<Button href={NEW_POST_PATH}>Написать пост</Button>}
        onChanged={() => setVersion(version + 1)}
      />
    </div>
  );
};

export default MyPosts;
