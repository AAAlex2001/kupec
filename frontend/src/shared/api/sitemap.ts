import { load } from "./server";

export type SitemapItem = {
  id: number;
  updated_at: string;
};

export type SitemapPage = {
  path: string;
  updated_at: string;
};

export type Sitemap = {
  listings: SitemapItem[];
  posts: SitemapItem[];
  articles: SitemapPage[];
  authors: number[];
};

const EMPTY_SITEMAP: Sitemap = { listings: [], posts: [], articles: [], authors: [] };

/** Открытые всем объявления, публикации, статьи и авторы — для sitemap.xml. */
export const getSitemap = () => load<Sitemap>("/v1/seo/sitemap", EMPTY_SITEMAP);
