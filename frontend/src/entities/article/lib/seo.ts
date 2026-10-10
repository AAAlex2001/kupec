import { articlePath, HOME_PATH } from "@/shared/config/routes";
import { SITE_NAME } from "@/shared/config/site";
import { absoluteUrl, OG_IMAGE } from "@/shared/lib/seo";
import type { Article } from "../model/types";
import { ARTICLE_SECTIONS } from "./sections";

/** Заголовок статьи для поисковиков: отдельный SEO-заголовок или обычный. */
export const articleTitle = (article: Article) => article.seo_title || article.title;

/** Описание статьи для поисковиков: отдельное SEO-описание или анонс. */
export const articleDescription = (article: Article) =>
  article.seo_description || article.description;

/** Разметка schema.org: новость или запись блога и путь «Главная → раздел → статья». */
export const articleJsonLd = (article: Article) => {
  const section = ARTICLE_SECTIONS[article.section];
  const url = absoluteUrl(articlePath(article.section, article.slug));
  const organization = {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl(HOME_PATH),
    logo: absoluteUrl("/logo.svg"),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": article.section === "news" ? "NewsArticle" : "BlogPosting",
        headline: article.title,
        description: articleDescription(article),
        keywords: article.seo_keywords || undefined,
        image: [absoluteUrl(article.cover_url ?? OG_IMAGE.url)],
        datePublished: article.published_at,
        dateModified: article.updated_at,
        mainEntityOfPage: url,
        url,
        author: organization,
        publisher: organization,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl(HOME_PATH) },
          { "@type": "ListItem", position: 2, name: section.title, item: absoluteUrl(section.path) },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
};
