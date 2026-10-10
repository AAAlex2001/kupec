"use client";

import { useState } from "react";
import { fetchThreads, type Comment, type Thread, type ThreadPage } from "@/entities/comment";
import type { Post } from "@/entities/post";
import { CommentForm } from "@/features/write-comment";
import { usePaged } from "@/shared/lib/use-paged";
import { useScrollToHash } from "@/shared/lib/use-scroll-to-hash";
import Button from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import CommentThread from "./ui/comment-thread";
import styles from "./style.module.scss";

const PAGE_SIZE = 10;

type PostCommentsProps = {
  id: string;
  post: Post;
};

/** Комментарии к публикации: счётчик, форма, ветки с ответами и «Загрузить ещё». По ссылке с #id прокручивается сюда. */
const PostComments = ({ id, post }: PostCommentsProps) => {
  const threads = usePaged<Thread, ThreadPage>(String(post.id), (offset) =>
    fetchThreads(post.id, PAGE_SIZE, offset),
  );
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  useScrollToHash(id, threads.items !== null);

  const sent = () => {
    setReplyTo(null);
    threads.reload();
  };

  return (
    <section id={id} className={styles.comments}>
      <Title as="h2">Комментарии · {threads.page?.comments_count ?? post.comments_count}</Title>

      <CommentForm postId={post.id} onSent={sent} />

      {threads.error && <Notice tone="error">{threads.error}</Notice>}
      {!threads.items && !threads.error && <Loader />}

      <div className={styles.list}>
        {threads.items?.map((thread) => (
          <CommentThread
            key={thread.comment.id}
            postId={post.id}
            thread={thread}
            replyTo={replyTo}
            onReply={setReplyTo}
            onSent={sent}
            onCancel={() => setReplyTo(null)}
          />
        ))}
      </div>

      {threads.hasMore && (
        <Button variant="secondary" loading={threads.loadingMore} onClick={threads.loadMore}>
          Загрузить ещё
        </Button>
      )}
    </section>
  );
};

export default PostComments;
