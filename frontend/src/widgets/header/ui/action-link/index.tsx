"use client";

import cn from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useUser } from "@/entities/user";
import styles from "./style.module.scss";

type ActionLinkProps = {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  requiresAuth?: boolean;
};

/** Пункт шапки «иконка над подписью». Закрытый раздел гостю открывает окно входа. */
const ActionLink = ({ label, icon, href, onClick, active, requiresAuth }: ActionLinkProps) => {
  const pathname = usePathname();
  const { user, openAuth } = useUser();

  if (!href || (requiresAuth && !user)) {
    return (
      <button type="button" className={styles.link} onClick={onClick ?? openAuth}>
        {icon}
        <span className={styles.label}>{label}</span>
      </button>
    );
  }

  const isActive = active ?? pathname.startsWith(href);

  return (
    <Link className={cn(styles.link, isActive && styles.active)} href={href}>
      {icon}
      <span className={styles.label}>{label}</span>
    </Link>
  );
};

export default ActionLink;
