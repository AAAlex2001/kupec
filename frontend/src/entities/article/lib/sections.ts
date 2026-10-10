import { BLOG_PATH, NEWS_PATH } from "@/shared/config/routes";
import type { ArticleSection } from "../model/types";

export const ARTICLE_SECTIONS: Record<
  ArticleSection,
  { title: string; path: string; lead: string; description: string }
> = {
  news: {
    title: "Новости",
    path: NEWS_PATH,
    lead: "Как безопасно покупать и продавать с рук, что с налогами и документами, как найти клиентов — коротко и по делу.",
    description:
      "Новости и разборы «Купца»: безопасные сделки с рук, налоги при продаже вещей, самозанятость, продажа домашних продуктов и услуг.",
  },
  blog: {
    title: "Блог",
    path: BLOG_PATH,
    lead: "Истории продавцов и мастеров, идеи для объявлений и советы, как продавать больше.",
    description:
      "Блог «Купца»: истории частных продавцов и мастеров, идеи и советы, как продавать товары и услуги по объявлениям.",
  },
};

export const ARTICLE_SECTION_TABS = [
  { value: "news", label: ARTICLE_SECTIONS.news.title },
  { value: "blog", label: ARTICLE_SECTIONS.blog.title },
];
