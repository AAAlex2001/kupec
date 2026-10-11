"use client";

import cn from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/entities/user";
import { useSupport } from "@/features/support-chat";
import { ACCOUNT_PATH, HOME_PATH } from "@/shared/config/routes";
import Badge from "@/shared/ui/badge";
import { HomeIcon, MessageCircleMoreIcon, UserRoundIcon } from "@/shared/ui/icons";
import { TAB_BAR_ITEMS } from "./data";
import styles from "./style.module.scss";

/** Нижний бар до ПК: круглое «стекло» с разделами и зелёной «Поддержкой». Закрытые разделы гостю открывают окно входа. */
const TabBar = () => {
  const pathname = usePathname();
  const { user, openAuth } = useUser();
  const { unread, openChat } = useSupport();

  const isActive = (href: string) => {
    if (href === HOME_PATH) return pathname === HOME_PATH;

    return pathname.startsWith(href);
  };

  const accountActive =
    pathname.startsWith(ACCOUNT_PATH) && !TAB_BAR_ITEMS.some(({ href }) => isActive(href));

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />

      <nav className={styles.bar} aria-label="Быстрые разделы">
        <Link
          className={cn(styles.item, isActive(HOME_PATH) && styles.active)}
          href={HOME_PATH}
          aria-current={isActive(HOME_PATH) ? "page" : undefined}
        >
          <span className={styles.icon}>
            <HomeIcon />
          </span>
          Главная
        </Link>

        <button type="button" className={cn(styles.item, styles.support)} onClick={openChat}>
          <span className={styles.icon}>
            <MessageCircleMoreIcon />
            {unread > 0 && (
              <span className={styles.count}>
                <Badge count={unread} />
              </span>
            )}
          </span>
          Поддержка
        </button>

        {TAB_BAR_ITEMS.map(({ label, href, Icon, accent, requiresAuth }) =>
          requiresAuth && !user ? (
            <button key={href} type="button" className={styles.item} onClick={openAuth}>
              <span className={cn(styles.icon, accent && styles.accent)}>
                <Icon />
              </span>
              {label}
            </button>
          ) : (
            <Link
              key={href}
              className={cn(styles.item, isActive(href) && styles.active)}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <span className={cn(styles.icon, accent && styles.accent)}>
                <Icon />
              </span>
              {label}
            </Link>
          ),
        )}

        {user ? (
          <Link
            className={cn(styles.item, accountActive && styles.active)}
            href={ACCOUNT_PATH}
            aria-current={accountActive ? "page" : undefined}
          >
            <span className={styles.icon}>
              <UserRoundIcon />
            </span>
            Профиль
          </Link>
        ) : (
          <button type="button" className={styles.item} onClick={openAuth}>
            <span className={styles.icon}>
              <UserRoundIcon />
            </span>
            Войти
          </button>
        )}
      </nav>
    </>
  );
};

export default TabBar;
