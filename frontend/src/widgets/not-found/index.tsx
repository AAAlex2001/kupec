import { FEED_PATH, HOME_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { BasketIcon } from "@/shared/ui/icons";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

/** Страница 404: «4-корзинка-4», пояснение и дорога на главную или в ленту. */
const NotFound = () => (
  <div className={styles.page}>
    <p className={styles.code} aria-hidden="true">
      4
      <BasketIcon className={styles.basket} />
      4
    </p>

    <Title as="h1">Такой страницы нет</Title>
    <p className={styles.text}>
      Возможно, объявление или публикацию сняли, а может, в адресе опечатка. Загляните на главную —
      там много свежего.
    </p>

    <div className={styles.actions}>
      <Button href={HOME_PATH}>На главную</Button>
      <Button variant="secondary" href={FEED_PATH}>
        Лента публикаций
      </Button>
    </div>
  </div>
);

export default NotFound;
