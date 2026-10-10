"use client";

import { useState } from "react";
import {
  fetchThreads,
  type Comment,
  type CommentTarget,
  type Thread,
  type ThreadPage,
} from "@/entities/comment";
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

type CommentsProps = {
  id: string;
  target: CommentTarget;
  count: number;
};

/** Обсуждение поста или статьи: счётчик, форма, ветки с ответами и «Загрузить ещё». По ссылке с #id прокручивается сюда. */
const Comments = ({ id, target, count }: CommentsProps) => {
  const threads = usePaged<Thread, ThreadPage>(`${target.kind}-${target.id}`, (offset) =>
    fetchThreads(target, PAGE_SIZE, offset),
  );
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  useScrollToHash(id, threads.items !== null);

  const sent = () => {
    setReplyTo(null);
    threads.reload();
  };

  return (
    <section id={id} className={styles.comments}>
      <Title as="h2">Комментарии · {threads.page?.comments_count ?? count}</Title>

      <CommentForm target={target} onSent={sent} />

      {threads.error && <Notice tone="error">{threads.error}</Notice>}
      {!threads.items && !threads.error && <Loader />}

      <div className={styles.list}>
        {threads.items?.map((thread) => (
          <CommentThread
            key={thread.comment.id}
            target={target}
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

export default Comments;
