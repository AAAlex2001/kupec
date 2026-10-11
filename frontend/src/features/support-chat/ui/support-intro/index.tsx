import styles from "./style.module.scss";

/** Приветствие поддержки в начале чата: с чем помогаем и что приложить. */
const SupportIntro = () => (
  <div className={styles.intro}>
    <p className={styles.title}>Здравствуйте! Это поддержка «Купца» 👋</p>
    <p className={styles.text}>
      Напишите, что случилось: не приходит код, не получается разместить объявление, нашли
      ошибку или мошенника. Если есть скриншот — приложите, так разберёмся быстрее.
    </p>
  </div>
);

export default SupportIntro;
