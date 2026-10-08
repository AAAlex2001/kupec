"use client";

import { useState } from "react";
import { useFavoriteListings, useFavorites } from "@/entities/favorite";
import type { Listing } from "@/entities/listing";
import { HOME_PATH } from "@/shared/config/routes";
import { plural } from "@/shared/lib/format";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { HeartIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import { ALL, LISTINGS, TABS } from "./data";
import FavoriteCard from "./ui/favorite-card";
import styles from "./style.module.scss";

/** Объявления вкладки: все или только товары, только услуги. */
const byTab = (listings: Listing[], tab: string) =>
  tab === ALL ? listings : listings.filter((listing) => listing.kind === tab);

/** Раздел «Избранное»: сохранённые объявления по вкладкам. Снятое сердечко убирает карточку. */
const Favorites = () => {
  const [tab, setTab] = useState(ALL);
  const { listings, error } = useFavoriteListings();
  const { isFavorite } = useFavorites();

  const saved = (listings ?? []).filter((listing) => isFavorite(listing.id));
  const shown = byTab(saved, tab);
  const tabs = TABS.map((item) => ({ ...item, count: byTab(saved, item.value).length }));

  return (
    <div className={styles.favorites}>
      <div className={styles.head}>
        <Title as="h1">Избранное</Title>
        <span className={styles.count}>
          {saved.length} {plural(saved.length, LISTINGS)}
        </span>
      </div>

      <Tabs ariaLabel="Тип объявлений" value={tab} tabs={tabs} onChange={setTab} />

      <p className={styles.hint}>Сохранённые объявления. Напишите автору, чтобы обсудить условия.</p>

      {error && <Notice tone="error">{error}</Notice>}
      {!listings && !error && <Loader />}

      {listings && shown.length === 0 && (
        <EmptyState
          icon={<HeartIcon />}
          title="В избранном пока пусто"
          text="Нажимайте на сердечко в объявлении, чтобы вернуться к нему позже."
          action={<Button href={HOME_PATH}>Все объявления</Button>}
        />
      )}

      <div className={styles.grid}>
        {shown.map((listing) => (
          <FavoriteCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
