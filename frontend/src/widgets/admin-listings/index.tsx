"use client";

import { useState } from "react";
import {
  ListingRow,
  STATUS_TABS,
  fetchAdminListings,
  type AdminListingPage,
  type Listing,
  type ListingStatus,
} from "@/entities/listing";
import { ListingActions } from "@/features/manage-listing";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import { SearchIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import styles from "./style.module.scss";

type AdminListingsProps = {
  ownerId?: number;
};

const PAGE_SIZE = 20;

/** Объявления в админке: вкладки по статусу, поиск и те же кнопки, что у автора. ownerId — только одного пользователя. */
const AdminListings = ({ ownerId }: AdminListingsProps) => {
  const [status, setStatus] = useState<ListingStatus>("published");
  const [query, setQuery] = useState("");
  const list = usePaged<Listing, AdminListingPage>(`${status}|${query}|${ownerId}`, (offset) =>
    fetchAdminListings(status, query, ownerId, PAGE_SIZE, offset),
  );

  return (
    <section className={styles.section}>
      <Tabs
        ariaLabel="Статус объявлений"
        value={status}
        tabs={STATUS_TABS.map((tab) => ({ ...tab, count: list.page?.counts[tab.value] ?? 0 }))}
        onChange={(value) => setStatus(value as ListingStatus)}
      />

      <Input
        value={query}
        onChange={setQuery}
        placeholder="Поиск по названию"
        ariaLabel="Поиск объявлений"
        maxLength={100}
        icon={<SearchIcon />}
      />

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}
      {list.items?.length === 0 && <p className={styles.empty}>Объявлений нет.</p>}

      <div className={styles.list}>
        {list.items?.map((listing) => (
          <ListingRow
            key={listing.id}
            listing={listing}
            actions={<ListingActions listing={listing} onDone={list.reload} />}
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

export default AdminListings;
