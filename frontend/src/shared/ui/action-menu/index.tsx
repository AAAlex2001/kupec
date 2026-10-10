"use client";

import { useRef, type ComponentType, type ReactNode } from "react";
import Button from "@/shared/ui/button";
import { EllipsisIcon } from "@/shared/ui/icons";
import type { IconProps } from "@/shared/ui/icons/types";
import { useMenu } from "./use-menu";
import styles from "./style.module.scss";

export type MenuAction = {
  label: string;
  Icon: ComponentType<IconProps>;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
};

type ActionMenuProps = {
  actions: MenuAction[];
  ariaLabel: string;
  trigger?: ReactNode;
};

/** Кнопка со списком действий с иконками: «⋯» или своя, например репост со счётчиком.
 *
 * Закрывается по клику мимо, Escape и после выбора.
 */
const ActionMenu = ({ actions, ariaLabel, trigger }: ActionMenuProps) => {
  const element = useRef<HTMLDivElement>(null);
  const { open, toggle, close } = useMenu(element);

  const button = trigger ? (
    <Button variant="tool" ariaLabel={ariaLabel} onClick={toggle}>
      {trigger}
    </Button>
  ) : (
    <Button variant="secondary" size="icon" ariaLabel={ariaLabel} onClick={toggle}>
      <EllipsisIcon />
    </Button>
  );

  return (
    <div ref={element} className={styles.menu}>
      {button}

      {open && (
        <div className={styles.list} role="menu">
          {actions.map(({ label, Icon, href, danger, onClick }) => (
            <Button
              key={label}
              className={danger ? styles.danger : styles.item}
              variant={danger ? "danger" : "ghost"}
              href={href}
              onClick={() => {
                close();
                onClick?.();
              }}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
