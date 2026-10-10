import type { Article } from "@/entities/article";
import { getArticles } from "@/entities/article/server";

const RELATED_COUNT = 3;

/** «Читайте также»: свежие статьи того же раздела без текущей. */
export const loadRelated = async (article: Article) => {
  const page = await getArticles(article.section, RELATED_COUNT + 1, 0);

  return page.items.filter((item) => item.id !== article.id).slice(0, RELATED_COUNT);
};
