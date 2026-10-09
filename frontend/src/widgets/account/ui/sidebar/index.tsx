"use client";

import cn from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/entities/conversation";
import { avatarLetter, displayName, type User } from "@/entities/user";
import { useLogout } from "@/features/logout";
import { MESSAGES_PATH } from "@/shared/config/routes";
import Avatar from "@/shared/ui/avatar";
import Badge from "@/shared/ui/badge";
import Button from "@/shared/ui/button";
import { LogOutIcon } from "@/shared/ui/icons";
import SegmentedNav from "@/shared/ui/segmented-nav";
import { ACCOUNT_SECTIONS, ADMIN_LINK } from "../../data";
import styles from "./style.module.scss";

type SidebarProps = {
  user: User;
};

/** Меню кабинета: профиль и разделы, у администратора — ещё «Админка». На ПК — список слева, до ПК — сегменты. */
const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const { pending, signOut } = useLogout();
  const unread = useUnreadCount();
  const sections = user.is_admin ? [...ACCOUNT_SECTIONS, ADMIN_LINK] : ACCOUNT_SECTIONS;
  const current = sections.find(({ href }) => pathname.startsWith(href));
  const counts = (href: string) => (href === MESSAGES_PATH ? unread : 0);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <Avatar src={user.avatar_url} letter={avatarLetter(user)} />

        <div className={styles.person}>
          <p className={styles.name}>{displayName(user)}</p>
          {user.city && <p className={styles.city}>{user.city.name}</p>}
        </div>

        <div className={styles.logout}>
          <Button variant="danger" loading={pending} onClick={signOut}>
            <LogOutIcon />
            Выйти
          </Button>
        </div>
      </div>

      <SegmentedNav
        className={styles.segments}
        ariaLabel="Разделы кабинета"
        current={current?.href}
        items={sections.map(({ href, label }) => ({ href, label, count: counts(href) }))}
      />

      <nav className={styles.nav} aria-label="Разделы кабинета">
        {sections.map(({ href, label, Icon }) => (
          <Link
            key={href}
            className={cn(styles.item, href === current?.href && styles.active)}
            href={href}
            aria-current={href === current?.href ? "page" : undefined}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
            {counts(href) > 0 && <Badge count={counts(href)} />}
          </Link>
        ))}

        <button
          type="button"
          className={cn(styles.item, styles.danger)}
          disabled={pending}
          onClick={signOut}
        >
          <LogOutIcon className={styles.icon} />
          <span className={styles.label}>Выйти</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
