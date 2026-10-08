import { PublishButton } from "@/features/publish-listing";
import { HOME_PATH } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Title from "@/shared/ui/title";
import type { InfoPageContent } from "./model/types";
import InfoContents from "./ui/info-contents";
import InfoFaq from "./ui/info-faq";
import InfoSection from "./ui/info-section";
import styles from "./style.module.scss";

export { HELP_PAGE } from "./content/help";
export { RULES_PAGE } from "./content/rules";

type InfoPageProps = {
  content: InfoPageContent;
};

/** Текстовая страница: оглавление, разделы с пунктами, частые вопросы и призыв разместить объявление. */
const InfoPage = ({ content }: InfoPageProps) => (
  <div className={styles.page}>
    <Breadcrumbs items={[{ label: "Главная", href: HOME_PATH }, { label: content.title }]} />

    <div className={styles.head}>
      <Title as="h1">{content.title}</Title>
      <p className={styles.lead}>{content.lead}</p>
    </div>

    <div className={styles.columns}>
      <aside className={styles.aside}>
        <InfoContents sections={content.sections} />
      </aside>

      <div className={styles.content}>
        {content.sections.map((section) => (
          <InfoSection key={section.id} section={section} />
        ))}

        <InfoFaq questions={content.questions} />

        <div className={styles.cta}>
          <p className={styles.ctaText}>Готовы начать? Разместить объявление можно за пару минут.</p>
          <PublishButton>Разместить объявление</PublishButton>
        </div>
      </div>
    </div>
  </div>
);

export default InfoPage;
