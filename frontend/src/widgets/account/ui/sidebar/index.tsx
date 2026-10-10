"use client";

import cn from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/entities/conversation";
import { useUnreadNotifications } from "@/entities/notification";
import { avatarLetter, displayName, type User } from "@/entities/user";
import { useLogout } from "@/features/logout";
import { ACCOUNT_PATH, MESSAGES_PATH, NOTIFICATIONS_PATH } from "@/shared/config/routes";
import Avatar from "@/shared/ui/avatar";
import Badge from "@/shared/ui/badge";
import { ChevronLeftIcon, ChevronRightIcon, LogOutIcon } from "@/shared/ui/icons";
import { ACCOUNT_SECTIONS, ADMIN_LINK } from "../../data";
import { findSection } from "../../lib/find-section";
import styles from "./style.module.scss";

type SidebarProps = {
  user: User;
};

/** Меню кабинета: профиль и разделы, у администратора — ещё «Админка».
 *
 * На ПК — всегда список слева. До ПК — как в Авито: на входе в кабинет список разделов,
 * а внутри раздела только «‹ Кабинет». На странице уведомлений они уже прочитаны — счётчик не показываем.
 */
const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const { pending, signOut } = useLogout();
  const unread = useUnreadCount();
  const unreadNotifications = useUnreadNotifications();
  const sections = user.is_admin ? [...ACCOUNT_SECTIONS, ADMIN_LINK] : ACCOUNT_SECTIONS;
  const current = findSection(sections, pathname);

  const counts = (href: string) => {
    if (href === MESSAGES_PATH) return unread;
    if (href === NOTIFICATIONS_PATH && pathname !== NOTIFICATIONS_PATH) return unreadNotifications;
    return 0;
  };

  return (
    <aside className={cn(styles.sidebar, pathname === ACCOUNT_PATH && styles.home)}>
      <Link className={styles.back} href={ACCOUNT_PATH}>
        <ChevronLeftIcon className={styles.backIcon} />
        Кабинет
      </Link>

      <div className={styles.profile}>
        <Avatar src={user.avatar_url} letter={avatarLetter(user)} />

        <div className={styles.person}>
          <p className={styles.name}>{displayName(user)}</p>
          {user.city && <p className={styles.city}>{user.city.name}</p>}
        </div>
      </div>

      <nav className={styles.nav} aria-label="Разделы кабинета">
        {sections.map(({ href, label, Icon, highlighted }) => (
          <Link
            key={href}
            className={cn(styles.item, highlighted && styles.highlighted, href === current?.href && styles.active)}
            href={href}
            aria-current={href === current?.href ? "page" : undefined}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
            {highlighted && (
              <span className={styles.sparkles} aria-hidden="true">
                <svg viewBox="0 0 32 28" fill="none">
                  <path className={styles.sparkleOne} fill="#9b63f4" d="m19 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
                  <path className={styles.sparkleTwo} fill="#3fb7ff" d="m7 13 1.4 4.6L13 19l-4.6 1.4L7 25l-1.4-4.6L1 19l4.6-1.4L7 13Z" />
                  <path className={styles.sparkleThree} fill="#db62e5" d="m27 18 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
                </svg>
              </span>
            )}
            {counts(href) > 0 && <Badge count={counts(href)} />}
            <ChevronRightIcon className={styles.chevron} />
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
