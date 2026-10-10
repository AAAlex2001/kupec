import Link from "next/link";
import type { CategoryNode } from "@/entities/category";
import { categoryPath, HOME_PATH } from "@/shared/config/routes";
import { SITE_DESCRIPTION, SITE_NAME } from "@/shared/config/site";
import Logo from "@/shared/ui/logo";
import { ALL_LISTINGS_LINK, COPYRIGHT, FOOTER_GROUPS, LEGAL_LINKS } from "./data";
import styles from "./style.module.scss";

type FooterProps = {
  categories: CategoryNode[];
};

/** Подвал: о площадке с «Новостями» и «Блогом», категории с главной, кабинет, публикации, помощь и правовая информация. */
const Footer = ({ categories }: FooterProps) => {
  const categoryLinks = categories.map(({ name, slug }) => ({ label: name, href: categoryPath(slug) }));
  const groups = [
    { title: "Категории", links: [...categoryLinks, ALL_LISTINGS_LINK] },
    ...FOOTER_GROUPS,
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Logo href={HOME_PATH} ariaLabel={`${SITE_NAME} — на главную`} size="sm" />
          <p className={styles.description}>{SITE_DESCRIPTION}</p>

        </div>

        <div className={styles.groups}>
          {groups.map(({ title, links }) => (
            <nav key={title} className={styles.group} aria-label={title}>
              <p className={styles.title}>{title}</p>

              <ul className={styles.links}>
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link className={styles.link} href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {SITE_NAME}, {new Date().getFullYear()} · {COPYRIGHT}
        </p>

        <nav className={styles.legal} aria-label="Правовая информация">
          {LEGAL_LINKS.map(({ label, href }) => (
            <Link key={href} className={styles.legalLink} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
