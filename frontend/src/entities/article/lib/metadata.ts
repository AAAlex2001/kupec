import type { Metadata } from "next";
import { articlePath } from "@/shared/config/routes";
import { pagePath } from "@/shared/lib/pagination";
import { OG_BASE, ogImages } from "@/shared/lib/seo";
import type { Article, ArticleSection } from "../model/types";
import { ARTICLE_SECTIONS } from "./sections";
import { articleDescription, articleTitle } from "./seo";

/** Метаданные страницы раздела «Новости» или «Блог». У каждой ?page свой адрес и заголовок. */
export const sectionMetadata = (section: ArticleSection, pageNumber: number): Metadata => {
  const meta = ARTICLE_SECTIONS[section];
  const path = pagePath(meta.path, pageNumber);
  const title = pageNumber > 1 ? `${meta.title} — страница ${pageNumber}` : meta.title;

  return {
    title,
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      ...OG_BASE,
      type: "website",
      title,
      description: meta.description,
      url: path,
    },
  };
};

/** Метаданные статьи: SEO-заголовок и описание, ключевые запросы, обложка и даты для превью. */
export const articleMetadata = (article: Article): Metadata => {
  const title = articleTitle(article);
  const description = articleDescription(article);
  const path = articlePath(article.section, article.slug);

  return {
    title,
    description,
    keywords: article.seo_keywords || undefined,
    alternates: { canonical: path },
    openGraph: {
      ...OG_BASE,
      type: "article",
      title,
      description,
      url: path,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      section: ARTICLE_SECTIONS[article.section].title,
      images: ogImages(article.cover_url),
    },
  };
};
