import cn from "classnames";
import type { ReactNode } from "react";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type NoticeProps = {
  tone?: "success" | "error" | "info";
  action?: ReactNode;
  children: ReactNode;
};

const ICONS = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  info: InfoIcon,
};

/** Плашка: итог действия, ошибка или серая подсказка. action — кнопка справа. */
const Notice = ({ tone = "success", action, children }: NoticeProps) => {
  const Icon = ICONS[tone];

  return (
    <div className={cn(styles.notice, styles[tone])} role={tone === "error" ? "alert" : "status"}>
      <Icon />
      <p className={styles.text}>{children}</p>
      {action}
    </div>
  );
};

export default Notice;
