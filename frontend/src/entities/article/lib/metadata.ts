import type { Metadata } from "next";
import { articlePath } from "@/shared/config/routes";
import { OG_BASE, ogImages } from "@/shared/lib/seo";
import type { Article, ArticleSection } from "../model/types";
import { ARTICLE_SECTIONS } from "./sections";
import { articleDescription, articleTitle } from "./seo";

/** Метаданные раздела «Новости» или «Блог». */
export const sectionMetadata = (section: ArticleSection): Metadata => {
  const meta = ARTICLE_SECTIONS[section];

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.path },
    openGraph: {
      ...OG_BASE,
      type: "website",
      title: meta.title,
      description: meta.description,
      url: meta.path,
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
