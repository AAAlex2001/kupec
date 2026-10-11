import type { Metadata } from "next";
import { sectionMetadata } from "@/entities/article";
import ArticleList, { loadArticlePage } from "@/widgets/article-list";

export const metadata: Metadata = sectionMetadata("blog");

/** Раздел «Блог»: первые 12 статей, новые первыми, дальше — «Загрузить ещё». */
export default async function BlogPage() {
  const page = await loadArticlePage("blog");

  return (
    <main>
      <ArticleList section="blog" page={page} />
    </main>
  );
}
