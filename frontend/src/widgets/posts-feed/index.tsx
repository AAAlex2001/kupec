"use client";

import { useState } from "react";
import type { PostPage } from "@/entities/post";
import { useUser } from "@/entities/user";
import { WritePostButton } from "@/features/write-post";
import { FEED_PATH } from "@/shared/config/routes";
import { offsetPath } from "@/shared/lib/pagination";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import PostList from "@/widgets/post-list";
import { FEED_EMPTY, FEED_LOADERS, FEED_PAGE_SIZE, FEED_TABS, type FeedTab } from "./data";
import { useFollowingUnseen } from "./model/use-following-unseen";
import styles from "./style.module.scss";

type PostsFeedProps = {
  initial: PostPage;
  pageNumber: number;
};

/** Адрес страницы ленты, с которой начинается пост под номером offset. */
const feedPageHref = (offset: number) => offsetPath(FEED_PATH, offset, FEED_PAGE_SIZE);

/** Раздел «Лента», открыт всем. Общая лента приходит с сервера постранично — для поисковиков.
 *
 * Вошедшему — вкладка «Подписки» с красным счётчиком новых постов, она грузится в браузере.
 */
const PostsFeed = ({ initial, pageNumber }: PostsFeedProps) => {
  const { user } = useUser();
  const [tab, setTab] = useState<FeedTab>("all");
  const unseen = useFollowingUnseen(Boolean(user));
  const fromServer = tab === "all";

  const open = (value: FeedTab) => {
    setTab(value);
    if (value === "following") unseen.seen();
  };

  const tabs = FEED_TABS.map((item) => ({
    ...item,
    badge: item.value === "following" ? unseen.count : 0,
  }));

  const initialPage = fromServer ? initial : undefined;
  const start = fromServer ? (pageNumber - 1) * FEED_PAGE_SIZE : 0;
  const pageHref = fromServer ? feedPageHref : undefined;

  return (
    <div className={styles.feed}>
      <div className={styles.head}>
        <Title as="h1">Лента</Title>
        <WritePostButton />
      </div>

      {user && (
        <Tabs ariaLabel="Лента" value={tab} tabs={tabs} onChange={(value) => open(value as FeedTab)} />
      )}

      <PostList
        key={tab}
        load={(offset) => FEED_LOADERS[tab](FEED_PAGE_SIZE, offset)}
        emptyTitle={FEED_EMPTY[tab].title}
        emptyText={FEED_EMPTY[tab].text}
        initial={initialPage}
        start={start}
        pageHref={pageHref}
      />
    </div>
  );
};

export default PostsFeed;
