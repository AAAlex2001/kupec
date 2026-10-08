import Link from "next/link";
import styles from "./style.module.scss";

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

/** Путь до страницы: «Главная / Разместить объявление». Последний пункт — без ссылки. */
const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav className={styles.breadcrumbs} aria-label="Навигационная цепочка">
    {items.map((item, index) => (
      <span key={item.label} className={styles.item}>
        {index > 0 && <span aria-hidden="true">/</span>}
        {item.href ? (
          <Link className={styles.link} href={item.href}>
            {item.label}
          </Link>
        ) : (
          <span aria-current="page">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumbs;
