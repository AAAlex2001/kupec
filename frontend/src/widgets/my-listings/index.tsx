"use client";

import { useState } from "react";
import { ListingRow, useMyListings, type ListingStatus } from "@/entities/listing";
import { ListingActions } from "@/features/manage-listing";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { RowsIcon, SearchIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import Notice from "@/shared/ui/notice";
import Loader from "@/shared/ui/loader";
import Tabs from "@/shared/ui/tabs";
import { EMPTY_TABS, NOTHING_FOUND, TABS } from "./data";
import styles from "./style.module.scss";

/** Раздел «Мои объявления»: вкладки по состоянию, поиск и список с действиями. */
const MyListings = () => {
  const [status, setStatus] = useState<ListingStatus>("published");
  const [query, setQuery] = useState("");
  const { data, error, reload } = useMyListings(status, query);
  const empty = query.trim() ? { ...NOTHING_FOUND, action: null } : EMPTY_TABS[status];

  return (
    <div className={styles.listings}>
      <Tabs
        ariaLabel="Состояние объявлений"
        value={status}
        tabs={TABS.map((tab) => ({ ...tab, count: data?.counts[tab.value] ?? 0 }))}
        onChange={(value) => setStatus(value as ListingStatus)}
      />

      <Input
        className={styles.search}
        value={query}
        onChange={setQuery}
        placeholder="Поиск по объявлениям…"
        ariaLabel="Поиск по объявлениям"
        maxLength={100}
        icon={<SearchIcon />}
      />

      {error && <Notice tone="error">{error}</Notice>}

      {!data && !error && <Loader />}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={<RowsIcon />}
          title={empty.title}
          text={empty.text}
          action={empty.action && <Button href={empty.action.href}>{empty.action.label}</Button>}
        />
      )}

      {data && data.items.length > 0 && (
        <div className={styles.list}>
          {data.items.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              actions={<ListingActions listing={listing} onDone={reload} />}
            />
          ))}
        </div>
      )}

      <p className={styles.hint}>Снятое объявление можно снова опубликовать из вкладки «Снятые».</p>
    </div>
  );
};

export default MyListings;
