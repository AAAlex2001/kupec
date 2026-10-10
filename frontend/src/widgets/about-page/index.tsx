import Image from "next/image";
import {
  ABOUT_PATH,
  HOME_PATH,
  NEW_LISTING_PATH,
  FEED_PATH,
  HELP_PATH,
} from "@/shared/config/routes";
import { absoluteUrl } from "@/shared/lib/seo";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Button from "@/shared/ui/button";
import Faq from "@/shared/ui/faq";
import JsonLd from "@/shared/ui/json-ld";
import Title from "@/shared/ui/title";
import { aboutQuestions } from "./content";
import styles from "./style.module.scss";

export const ABOUT_TITLE = "О проекте";
export const ABOUT_DESCRIPTION =
  "Купец — площадка частных объявлений по всей России. Находите товары и услуги рядом, делитесь полезным и общайтесь напрямую.";

const AboutPage = () => (
  <div className={styles.page}>
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: ABOUT_TITLE,
        description: ABOUT_DESCRIPTION,
        url: absoluteUrl(ABOUT_PATH),
        inLanguage: "ru-RU",
      }}
    />
    <div className={styles.breadcrumbs}>
      <Breadcrumbs
        items={[{ label: "Главная", href: HOME_PATH }, { label: ABOUT_TITLE }]}
      />
    </div>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>Знакомьтесь, Купец</span>
        <Title as="h1" className={styles.heading}>
          Хорошие вещи и люди.<br />
          Ближе, чем кажется.
        </Title>
        <p>Находим нужное, делимся полезным и помогаем друг другу каждый день.</p>
      </div>
      <Image
        className={styles.heroImage}
        src="/images/about/hero-v3.webp"
        alt="Маленький город на голубом полушарии: люди, дома и вещи, которые объединяют соседей"
        width={1774}
        height={887}
        preload
        quality={95}
        sizes="100vw"
      />
    </section>

    <div className={styles.content}>
      <section className={styles.mission}>
        <span className={styles.eyebrow}>Наша идея</span>
        <Title className={styles.missionTitle}>
          У каждого есть <span>что предложить.</span><br />
          А рядом — тот, кому это нужно.
        </Title>
        <p>
          Мы создаём место, где вещи находят новый дом, мастера — клиентов,
          а люди — полезные знакомства. Всё начинается с простого объявления.
        </p>
      </section>

      <section className={styles.story}>
        <Image
          className={styles.storyImage}
          src="/images/about/neighborhood.webp"
          alt="Миниатюрный город с домами, товарами и корзиной покупок"
          width={1600}
          height={900}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Что мы делаем</span>
          <Title>Помогаем найти своё рядом</Title>
          <p>
            Домашние продукты, мебель, техника, одежда или помощь специалиста —
            на Купце можно найти товары и услуги для самых разных задач.
          </p>
          <p>
            Выберите город, откройте нужную категорию и свяжитесь с автором
            объявления. О цене, встрече и деталях услуги вы договариваетесь напрямую.
          </p>
          <Button href={HOME_PATH} variant="outline">
            Посмотреть объявления
          </Button>
        </div>
      </section>

      <section className={`${styles.story} ${styles.reverse}`}>
        <Image
          className={styles.storyImage}
          src="/images/about/everyday.webp"
          alt="Повседневные вещи, соединённые голубой лентой"
          width={1600}
          height={900}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Больше, чем объявления</span>
          <Title>Общение, из которого вырастает полезное</Title>
          <p>
            У каждого есть история, совет или опыт, которым хочется поделиться.
            Публикации помогают рассказать об этом и обсудить интересное с другими.
          </p>
          <p>
            А в новостях и блоге можно найти подсказки: как подготовить объявление,
            проверить вещь перед покупкой и договориться о безопасной встрече.
          </p>
          <Button href={FEED_PATH} variant="outline">
            Читать публикации
          </Button>
        </div>
      </section>

      <div className={styles.faqSection}>
        <Image
          className={styles.storyImage}
          src="/images/about/faq.webp"
          alt="Корзина и облака диалога со знаком вопроса"
          width={1599}
          height={900}
          sizes="(min-width: 1024px) 40vw, 100vw"
        />
        <Faq questions={aboutQuestions} />
      </div>

      <section className={styles.invitation}>
        <Title>Начните с простого</Title>
        <p>Найдите что-нибудь нужное или расскажите о том, что можете предложить.</p>
        <div className={styles.actions}>
          <Button href={NEW_LISTING_PATH}>Разместить объявление</Button>
          <Button href={HELP_PATH} variant="outline">
            Как всё устроено
          </Button>
        </div>
      </section>
    </div>
  </div>
);

export default AboutPage;
