"use client";

import { useState } from "react";
import {
  fetchAdminPosts,
  fetchAdminUserPosts,
  PostCard,
  type AdminPostPage,
  type Post,
  type PostStatus,
} from "@/entities/post";
import { PostModeration } from "@/features/moderate-post";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

const TABS: { value: PostStatus; label: string }[] = [
  { value: "published", label: "Опубликованные" },
  { value: "hidden", label: "Скрытые" },
];

const AUTHOR_TABS: { value: PostStatus; label: string }[] = [
  { value: "published", label: "Опубликованные" },
  { value: "draft", label: "Черновики" },
  { value: "hidden", label: "Скрытые" },
];

const PAGE_SIZE = 20;

type AdminPostsProps = {
  authorId?: number;
};

/** Админка «Публикации»: посты по вкладкам, скрыть, вернуть или удалить.
 *
 * authorId — только посты этого пользователя, с черновиками; для страницы пользователя, без своего заголовка.
 */
const AdminPosts = ({ authorId }: AdminPostsProps) => {
  const [status, setStatus] = useState<PostStatus>("published");
  const list = usePaged<Post, AdminPostPage>(`${authorId ?? "all"}-${status}`, (offset) =>
    authorId
      ? fetchAdminUserPosts(authorId, status, PAGE_SIZE, offset)
      : fetchAdminPosts(status, PAGE_SIZE, offset),
  );
  const tabs = authorId ? AUTHOR_TABS : TABS;

  return (
    <section className={styles.section}>
      {!authorId && <Title as="h1">Публикации</Title>}

      <Tabs
        ariaLabel="Состояние публикаций"
        value={status}
        tabs={tabs.map((tab) => ({ ...tab, count: list.page?.counts[tab.value] ?? 0 }))}
        onChange={(value) => setStatus(value as PostStatus)}
      />

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}
      {list.items?.length === 0 && <p className={styles.empty}>Здесь пусто.</p>}

      <div className={styles.list}>
        {list.items?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            footer={<PostModeration post={post} onDone={list.reload} />}
          />
        ))}
      </div>

      {list.hasMore && (
        <Button variant="secondary" loading={list.loadingMore} onClick={list.loadMore}>
          Показать ещё
        </Button>
      )}
    </section>
  );
};

export default AdminPosts;
