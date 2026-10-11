"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ADMIN_ARTICLES_PATH,
  ADMIN_ATTRIBUTES_PATH,
  ADMIN_CATEGORIES_PATH,
  ADMIN_LISTINGS_PATH,
  ADMIN_POSTS_PATH,
  ADMIN_REPORTS_PATH,
  ADMIN_REVIEWS_PATH,
  ADMIN_SUPPORT_PATH,
  ADMIN_UNITS_PATH,
  ADMIN_USERS_PATH,
  HOME_PATH,
} from "@/shared/config/routes";
import Logo from "@/shared/ui/logo";
import SegmentedNav from "@/shared/ui/segmented-nav";
import { useSupportCount } from "./model/use-support-count";
import styles from "./style.module.scss";

const SECTIONS = [
  { href: ADMIN_USERS_PATH, label: "Пользователи" },
  { href: ADMIN_LISTINGS_PATH, label: "Объявления" },
  { href: ADMIN_REVIEWS_PATH, label: "Отзывы" },
  { href: ADMIN_POSTS_PATH, label: "Публикации" },
  { href: ADMIN_REPORTS_PATH, label: "Жалобы" },
  { href: ADMIN_SUPPORT_PATH, label: "Поддержка" },
  { href: ADMIN_ARTICLES_PATH, label: "Статьи" },
  { href: ADMIN_CATEGORIES_PATH, label: "Категории" },
  { href: ADMIN_ATTRIBUTES_PATH, label: "Атрибуты" },
  { href: ADMIN_UNITS_PATH, label: "Единицы" },
];

type AdminShellProps = {
  children: ReactNode;
};

/** Оболочка админки: шапка с логотипом, разделы сегментами во всю ширину и содержимое раздела. */
const AdminShell = ({ children }: AdminShellProps) => {
  const pathname = usePathname();
  const supportCount = useSupportCount(pathname);
  const sections = SECTIONS.map((section) => ({
    ...section,
    count: section.href === ADMIN_SUPPORT_PATH ? supportCount : undefined,
  }));
  const current = SECTIONS.find(({ href }) => pathname.startsWith(href));

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Logo href={HOME_PATH} ariaLabel="Купец — на главную" size="sm" />
      </header>

      <main className={styles.main}>
        <SegmentedNav ariaLabel="Разделы админки" items={sections} current={current?.href} />
        {children}
      </main>
    </div>
  );
};

export default AdminShell;
