"use client";

import { useState } from "react";
import { UserRow, fetchAdminUsers, type AdminUser, type AdminUserPage } from "@/entities/user";
import { adminUserPath } from "@/shared/config/routes";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import { SearchIcon } from "@/shared/ui/icons";
import Input from "@/shared/ui/input";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

const PAGE_SIZE = 20;

/** Админка «Пользователи»: поиск по почте и имени и список с «Показать ещё». */
const AdminUsers = () => {
  const [query, setQuery] = useState("");
  const list = usePaged<AdminUser, AdminUserPage>(query, (offset) =>
    fetchAdminUsers(query, PAGE_SIZE, offset),
  );

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Title as="h1">Пользователи</Title>
        {list.page && <span className={styles.total}>{list.page.total}</span>}
      </div>

      <Input
        value={query}
        onChange={setQuery}
        placeholder="Поиск по почте или имени"
        ariaLabel="Поиск пользователей"
        maxLength={100}
        icon={<SearchIcon />}
      />

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}
      {list.items?.length === 0 && <p className={styles.empty}>Никого не нашли.</p>}

      <div className={styles.list}>
        {list.items?.map((user) => (
          <UserRow key={user.id} user={user} href={adminUserPath(user.id)} />
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

export default AdminUsers;
