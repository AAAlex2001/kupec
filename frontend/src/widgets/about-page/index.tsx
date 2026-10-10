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
import JsonLd from "@/shared/ui/json-ld";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

export const ABOUT_TITLE = "О Купце";
export const ABOUT_DESCRIPTION = "Купец — площадка частных объявлений по всей России. Находите товары и услуги рядом, делитесь полезным и общайтесь напрямую.";

const possibilities = [
  {
    title: "Вещи находят новый дом",
    text: "Одежда, техника, мебель и другие полезные вещи могут пригодиться кому-то ещё. Расскажите о них в объявлении.",
  },
  {
    title: "Мастера находят клиентов",
    text: "От ремонта и домашних продуктов до занятий с тренером: здесь можно предложить свои услуги и найти специалиста рядом.",
  },
  {
    title: "Люди делятся опытом",
    text: "Публикуйте истории, обсуждайте интересное и читайте новости и блог с советами для покупателей и продавцов.",
  },
];

const AboutPage = () => (
  <div className={styles.page}>
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: ABOUT_TITLE,
        description: ABOUT_DESCRIPTION,
        url: absoluteUrl(ABOUT_PATH),
      }}
    />
    <Breadcrumbs
      items={[{ label: "Главная", href: HOME_PATH }, { label: ABOUT_TITLE }]}
    />
    <section className={styles.hero}>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Знакомьтесь, Купец</span>
        <Title as="h1" className={styles.heading}>
          Полезные вещи.<br />
          Хорошие люди.<br />
          Рядом с вами.
        </Title>
        <p>{ABOUT_DESCRIPTION}</p>
        <div className={styles.actions}>
          <Button href={HOME_PATH}>Найти что-нибудь нужное</Button>
          <Button href={NEW_LISTING_PATH} variant="outline">
            Разместить объявление
          </Button>
        </div>
      </div>
      <Image
        className={styles.heroImage}
        src="/images/about/neighborhood.webp"
        alt="Миниатюрный город с домами, товарами и корзиной покупок"
        width={1600}
        height={900}
        preload
        sizes="(min-width: 1024px) 55vw, 100vw"
      />
    </section>
    <section className={styles.section}>
      <Title>Больше возможностей для каждого дня</Title>
      <div className={styles.cards}>
        {possibilities.map(({ title, text }, index) => (
          <article key={title} className={styles.card}>
            <span className={styles.number}>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
    <section className={styles.story}>
      <Image
        className={styles.storyImage}
        src="/images/about/everyday.webp"
        alt="Корзина и повседневные вещи, соединённые голубой лентой"
        width={1600}
        height={900}
        sizes="(min-width: 1024px) 45vw, 100vw"
      />
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Наша идея</span>
        <Title>У каждого есть что предложить</Title>
        <p>
          Вещь, которой вы больше не пользуетесь. Навык, который поможет соседу. История, которая окажется полезной другим. Купец помогает всему этому найти своего человека.
        </p>
        <p>
          Вы выбираете свой город, находите объявления и связываетесь с автором напрямую. Условия покупки, встречи или услуги обсуждаете между собой.
        </p>
        <Button href={FEED_PATH} variant="secondary">
          Посмотреть публикации
        </Button>
      </div>
    </section>
    <section className={styles.invitation}>
      <Title>Начните с простого</Title>
      <p>
        Посмотрите, что предлагают рядом, или разместите своё первое объявление. А если нужна подсказка — загляните в помощь.
      </p>
      <div className={styles.actions}>
        <Button href={NEW_LISTING_PATH}>Разместить объявление</Button>
        <Button href={HELP_PATH} variant="outline">
          Как всё устроено
        </Button>
      </div>
    </section>
  </div>
);

export default AboutPage;
