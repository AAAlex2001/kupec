"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useUser } from "@/entities/user";
import Button from "@/shared/ui/button";
import { PlusIcon } from "@/shared/ui/icons";
import Title from "@/shared/ui/title";
import { ACCOUNT_SECTIONS } from "./data";
import Sidebar from "./ui/sidebar";
import styles from "./style.module.scss";

export { default as AccountSettings } from "./ui/settings";
export { default as AccountEmpty } from "./ui/empty";

type AccountProps = {
  children: ReactNode;
};

/** Оболочка кабинета: меню слева, справа заголовок и содержимое раздела. Гостю — кнопка входа. */
const Account = ({ children }: AccountProps) => {
  const { user, openAuth } = useUser();
  const pathname = usePathname();
  const section = ACCOUNT_SECTIONS.find(({ href }) => pathname.startsWith(href));

  if (!user) {
    return (
      <div className={styles.account}>
        <div className={styles.guest}>
          <Title as="h1">Личный кабинет</Title>
          <p className={styles.text}>Войдите по почте, чтобы открыть кабинет.</p>
          <Button onClick={openAuth}>Войти</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.account}>
      <Sidebar user={user} />

      <section className={styles.content}>
        {section && !section.ownTitle && (
          <div className={styles.head}>
            <Title as="h1">{section.label}</Title>

            {section.action && (
              <Button href={section.action.href}>
                <PlusIcon />
                {section.action.label}
              </Button>
            )}
          </div>
        )}

        {children}
      </section>
    </div>
  );
};

export default Account;
