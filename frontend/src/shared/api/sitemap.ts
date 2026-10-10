import { load } from "./server";

export type SitemapItem = {
  id: number;
  updated_at: string;
};

export type Sitemap = {
  listings: SitemapItem[];
  posts: SitemapItem[];
  authors: number[];
};

const EMPTY_SITEMAP: Sitemap = { listings: [], posts: [], authors: [] };

/** Открытые всем объявления, публикации и авторы — для sitemap.xml. */
export const getSitemap = () => load<Sitemap>("/v1/seo/sitemap", EMPTY_SITEMAP);
