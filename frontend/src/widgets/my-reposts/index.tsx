"use client";

import { fetchMyReposts } from "@/entities/post";
import { FEED_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Title from "@/shared/ui/title";
import PostList from "@/widgets/post-list";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Раздел «Репосты»: свои репосты — простые и с комментарием, новые первыми. */
const MyReposts = () => (
  <div className={styles.reposts}>
    <Title as="h1">Репосты</Title>

    <PostList
      load={(offset) => fetchMyReposts(PAGE_SIZE, offset)}
      emptyTitle="Репостов пока нет"
      emptyText="Нажмите на стрелки под постом, чтобы поделиться им у себя."
      emptyAction={<Button href={FEED_PATH}>Перейти в ленту</Button>}
    />
  </div>
);

export default MyReposts;
