import cn from "classnames";
import styles from "./style.module.scss";

type SpinnerProps = {
  className?: string;
};

/** Крутилка загрузки цвета текста вокруг. */
const Spinner = ({ className }: SpinnerProps) => (
  <span className={cn(styles.spinner, className)} aria-hidden="true" />
);

export default Spinner;
