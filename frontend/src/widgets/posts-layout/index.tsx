"use client";

import cn from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SegmentedNav from "@/shared/ui/segmented-nav";
import { POSTS_SECTIONS } from "./data";
import styles from "./style.module.scss";

type PostsLayoutProps = {
  standalone?: boolean;
  children: ReactNode;
};

/** Раздел «Публикации»: на ПК меню раздела справа, до ПК — сегменты над содержимым.
 *
 * standalone — отдельная страница вне кабинета (лента, пост) со своими полями по краям.
 */
const PostsLayout = ({ standalone, children }: PostsLayoutProps) => {
  const pathname = usePathname();
  const current = POSTS_SECTIONS.find(({ href }) => pathname.startsWith(href))?.href;

  return (
    <div className={cn(styles.layout, standalone && styles.standalone)}>
      <SegmentedNav
        className={styles.segments}
        ariaLabel="Разделы публикаций"
        current={current}
        items={POSTS_SECTIONS.map(({ href, label }) => ({ href, label }))}
      />

      <div className={styles.content}>{children}</div>

      <nav className={styles.nav} aria-label="Разделы публикаций">
        {POSTS_SECTIONS.map(({ href, label, Icon }) => (
          <Link key={href} className={cn(styles.item, href === current && styles.active)} href={href}>
            <Icon className={styles.icon} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default PostsLayout;
