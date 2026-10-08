import cn from "classnames";
import Form from "next/form";
import { SearchIcon } from "@/shared/ui/icons";
import styles from "./style.module.scss";

type SearchFormProps = {
  className?: string;
};

/** Поиск по объявлениям в шапке: запрос уходит на страницу поиска в параметре q. */
const SearchForm = ({ className }: SearchFormProps) => (
  <Form className={cn(styles.form, className)} action="/search" role="search">
    <label className={styles.field}>
      <SearchIcon className={styles.icon} />

      <input
        className={styles.input}
        type="search"
        name="q"
        placeholder="Найти услугу или товар"
        aria-label="Поиск по объявлениям"
        maxLength={100}
        autoComplete="off"
      />
    </label>

    <button className={styles.submit} type="submit">
      Найти
    </button>
  </Form>
);

export default SearchForm;
