"use client";

import { useState, type ReactNode } from "react";
import type { Post, PostPage } from "@/entities/post";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { FileTextIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import PostItem from "./ui/post-item";
import styles from "./style.module.scss";

export { default as PostItem } from "./ui/post-item";

type PostListProps = {
  load: (offset: number) => Promise<PostPage>;
  emptyTitle: string;
  emptyText: string;
  emptyAction?: ReactNode;
  dropUnsaved?: boolean;
  onChanged?: () => void;
};

/** Список постов с «Показать ещё». dropUnsaved — убирать пост сразу, как его убрали из сохранённого. */
const PostList = ({
  load,
  emptyTitle,
  emptyText,
  emptyAction,
  dropUnsaved,
  onChanged,
}: PostListProps) => {
  const list = usePaged<Post, PostPage>("posts", load);
  const [dropped, setDropped] = useState<number[]>([]);
  const items = list.items?.filter((post) => !dropped.includes(post.id));

  const deleted = () => {
    list.reload();
    onChanged?.();
  };

  const unsaved = (post: Post) => {
    if (dropUnsaved) setDropped([...dropped, post.id]);
  };

  return (
    <>
      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!items && !list.error && <Loader />}

      {items?.length === 0 && (
        <EmptyState icon={<FileTextIcon />} title={emptyTitle} text={emptyText} action={emptyAction} />
      )}

      <div className={styles.list}>
        {items?.map((post) => (
          <PostItem key={post.id} post={post} onDeleted={deleted} onUnsaved={() => unsaved(post)} />
        ))}
      </div>

      {list.hasMore && (
        <Button variant="secondary" loading={list.loadingMore} onClick={list.loadMore}>
          Показать ещё
        </Button>
      )}
    </>
  );
};

export default PostList;
