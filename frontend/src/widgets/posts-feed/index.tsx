"use client";

import { useState } from "react";
import { useUser } from "@/entities/user";
import { WritePostButton } from "@/features/write-post";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import PostList from "@/widgets/post-list";
import { FEED_EMPTY, FEED_LOADERS, FEED_TABS, type FeedTab } from "./data";
import { useFollowingUnseen } from "./model/use-following-unseen";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Раздел «Лента», открыт всем. Вошедшему — вкладка «Подписки» с красным счётчиком новых постов. */
const PostsFeed = () => {
  const { user } = useUser();
  const [tab, setTab] = useState<FeedTab>("all");
  const unseen = useFollowingUnseen(Boolean(user));

  const open = (value: FeedTab) => {
    setTab(value);
    if (value === "following") unseen.seen();
  };

  const tabs = FEED_TABS.map((item) => ({
    ...item,
    badge: item.value === "following" ? unseen.count : 0,
  }));

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
        load={(offset) => FEED_LOADERS[tab](PAGE_SIZE, offset)}
        emptyTitle={FEED_EMPTY[tab].title}
        emptyText={FEED_EMPTY[tab].text}
      />
    </div>
  );
};

export default PostsFeed;
