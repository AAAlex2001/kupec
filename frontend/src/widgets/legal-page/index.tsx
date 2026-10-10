import Link from "next/link";
import type { Metadata } from "next";
import { LEGAL_DETAILS_COMPLETE, LEGAL_OPERATOR, LEGAL_REVISION } from "@/shared/config/legal";
import { HOME_PATH, PERSONAL_DATA_PATH, PRIVACY_PATH, TERMS_PATH } from "@/shared/config/routes";
import { SITE_NAME } from "@/shared/config/site";
import { absoluteUrl, OG_BASE, OG_COVERS } from "@/shared/lib/seo";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import DocToc from "@/shared/ui/doc-toc";
import JsonLd from "@/shared/ui/json-ld";
import Title from "@/shared/ui/title";
import type { LegalDocument } from "./model";
import styles from "./style.module.scss";

const DOCUMENTS = [
  { href: TERMS_PATH, label: "Пользовательское соглашение" },
  { href: PRIVACY_PATH, label: "Политика конфиденциальности" },
  { href: PERSONAL_DATA_PATH, label: "Политика обработки персональных данных" },
];

export const legalMetadata = (document: LegalDocument): Metadata => ({
  title: document.title,
  description: document.description,
  alternates: { canonical: document.path },
  robots: { index: LEGAL_DETAILS_COMPLETE, follow: true },
  openGraph: {
    ...OG_BASE,
    type: "website",
    title: document.title,
    description: document.description,
    url: document.path,
    images: [OG_COVERS[document.cover]],
  },
});

const LegalPage = ({ document }: { document: LegalDocument }) => (
  <main className={styles.page}>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: document.title,
      description: document.description,
      url: absoluteUrl(document.path),
      dateModified: LEGAL_REVISION,
      inLanguage: "ru-RU",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl(HOME_PATH) },
    }} />
    <Breadcrumbs items={[{ label: "Главная", href: HOME_PATH }, { label: document.title }]} />
    <header className={styles.head}>
      <p className={styles.eyebrow}>Правовая информация</p>
      <Title as="h1">{document.title}</Title>
      <p className={styles.lead}>{document.description}</p>
      <p className={styles.revision}>Редакция от <time dateTime={LEGAL_REVISION}>10 октября 2026 года</time></p>
    </header>
    <div className={styles.columns}>
      <aside className={styles.aside}>
        <DocToc
          items={[
            { id: "operator", title: "Владелец и контакты" },
            ...document.sections.map(({ id, title }) => ({ id, title })),
            { id: "related", title: "Другие документы" },
          ]}
        />
      </aside>
      <article className={styles.article}>
        <section id="operator" className={styles.section}>
          <Title>Владелец и контакты</Title>
          <dl className={styles.details}>
            <dt>Владелец сайта / оператор персональных данных</dt>
            <dd>{LEGAL_OPERATOR.name || "Сведения не заполнены владельцем сайта"}</dd>
            {LEGAL_OPERATOR.registration && (
              <>
                <dt>Регистрационные сведения</dt>
                <dd>{LEGAL_OPERATOR.registration}</dd>
              </>
            )}
            <dt>Адрес для электронных обращений</dt>
            <dd>
              {LEGAL_OPERATOR.email ? (
                <a href={`mailto:${LEGAL_OPERATOR.email}`}>
                  {LEGAL_OPERATOR.email}
                </a>
              ) : "Не указана"}
            </dd>
          </dl>
        </section>
        {document.sections.map((section) => (
          <section id={section.id} key={section.id} className={styles.section}>
            <Title>{section.title}</Title>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
        ))}
        <section id="related" className={styles.section}>
          <Title>Другие документы</Title>
          <nav className={styles.related} aria-label="Правовые документы">
            {DOCUMENTS.filter(({ href }) => href !== document.path).map(({ href, label }) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </section>
      </article>
    </div>
  </main>
);

export default LegalPage;
