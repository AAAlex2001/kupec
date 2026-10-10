"use client";

import { fetchSavedPosts } from "@/entities/post";
import { FEED_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Title from "@/shared/ui/title";
import PostList from "@/widgets/post-list";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Раздел «Сохранённое»: посты, отмеченные закладкой, недавно сохранённые первыми. */
const SavedPosts = () => (
  <div className={styles.saved}>
    <Title as="h1">Сохранённое</Title>

    <PostList
      load={(offset) => fetchSavedPosts(PAGE_SIZE, offset)}
      emptyTitle="Сохранённых публикаций нет"
      emptyText="Нажмите на закладку под постом, чтобы он появился здесь."
      emptyAction={<Button href={FEED_PATH}>Перейти в ленту</Button>}
      dropUnsaved
    />
  </div>
);

export default SavedPosts;
