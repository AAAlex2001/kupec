import type { MetadataRoute } from "next";
import { categorySlugs, getCategoryTree } from "@/entities/category/server";
import { getSitemap } from "@/shared/api/sitemap";
import {
  BLOG_PATH,
  categoryPath,
  FEED_PATH,
  HELP_PATH,
  HOME_PATH,
  listingPath,
  NEWS_PATH,
  postPath,
  PERSONAL_DATA_PATH,
  PRIVACY_PATH,
  RULES_PATH,
  TERMS_PATH,
  userPath,
} from "@/shared/config/routes";
import { absoluteUrl } from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  HOME_PATH,
  FEED_PATH,
  NEWS_PATH,
  BLOG_PATH,
  HELP_PATH,
  RULES_PATH,
  TERMS_PATH,
  PRIVACY_PATH,
  PERSONAL_DATA_PATH,
];

/** Карта сайта: главная, справка, категории, объявления, публикации, статьи и авторы. Кабинета и админки здесь нет. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tree, found] = await Promise.all([getCategoryTree(), getSitemap()]);

  const pages = STATIC_PATHS.map((path) => ({ url: absoluteUrl(path) }));
  const categories = categorySlugs(tree).map((slug) => ({ url: absoluteUrl(categoryPath(slug)) }));
  const listings = found.listings.map((item) => ({
    url: absoluteUrl(listingPath(item.id)),
    lastModified: item.updated_at,
  }));
  const posts = found.posts.map((item) => ({
    url: absoluteUrl(postPath(item.id)),
    lastModified: item.updated_at,
  }));
  const articles = found.articles.map((item) => ({
    url: absoluteUrl(item.path),
    lastModified: item.updated_at,
  }));
  const authors = found.authors.map((id) => ({ url: absoluteUrl(userPath(id)) }));

  return [...pages, ...categories, ...articles, ...listings, ...posts, ...authors];
}
