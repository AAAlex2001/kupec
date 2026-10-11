import type { Metadata } from "next";
import { sectionMetadata } from "@/entities/article";
import ArticleList, { loadArticlePage } from "@/widgets/article-list";

export const metadata: Metadata = sectionMetadata("news");

/** Раздел «Новости»: первые 12 статей, новые первыми, дальше — «Загрузить ещё». */
export default async function NewsPage() {
  const page = await loadArticlePage("news");

  return (
    <main>
      <ArticleList section="news" page={page} />
    </main>
  );
}
