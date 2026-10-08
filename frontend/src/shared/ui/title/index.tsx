import cn from "classnames";
import type { ReactNode } from "react";
import styles from "./style.module.scss";

type TitleProps = {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

/** Заголовок раздела или окна: 24px, жирный. */
const Title = ({ children, as: Tag = "h2", className }: TitleProps) => (
  <Tag className={cn(styles.title, className)}>{children}</Tag>
);

export default Title;
