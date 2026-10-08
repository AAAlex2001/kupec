"use client";

import { useRef } from "react";
import Button from "@/shared/ui/button";
import { EllipsisIcon } from "@/shared/ui/icons";
import { useMenu } from "./use-menu";
import styles from "./style.module.scss";

export type MenuAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type ActionMenuProps = {
  actions: MenuAction[];
  ariaLabel: string;
};

/** Кнопка «⋯» со списком действий. Закрывается по клику мимо, Escape и после выбора. */
const ActionMenu = ({ actions, ariaLabel }: ActionMenuProps) => {
  const element = useRef<HTMLDivElement>(null);
  const { open, toggle, close } = useMenu(element);

  return (
    <div ref={element} className={styles.menu}>
      <Button variant="secondary" size="icon" ariaLabel={ariaLabel} onClick={toggle}>
        <EllipsisIcon />
      </Button>

      {open && (
        <div className={styles.list} role="menu">
          {actions.map(({ label, href, onClick }) => (
            <Button
              key={label}
              className={styles.item}
              variant="ghost"
              href={href}
              onClick={() => {
                close();
                onClick?.();
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
