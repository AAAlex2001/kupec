import cn from "classnames";
import Spinner from "@/shared/ui/spinner";
import styles from "./style.module.scss";

type LoaderProps = {
  page?: boolean;
};

/** Крутилка по центру контейнера. page — на весь экран под шапкой. */
const Loader = ({ page }: LoaderProps) => (
  <div className={cn(styles.loader, page && styles.page)} role="status" aria-label="Загрузка">
    <Spinner className={styles.spinner} />
  </div>
);

export default Loader;
