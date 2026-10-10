import type { Metadata } from "next";
import { pageNumberFrom, sectionMetadata } from "@/entities/article";
import ArticleList, { loadArticlePage } from "@/widgets/article-list";

type BlogPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Название, описание и адрес страницы раздела «Блог». */
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  return sectionMetadata("blog", pageNumberFrom((await searchParams).page));
}

/** Раздел «Блог»: статьи по 12 на страницу, новые первыми. */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const page = await loadArticlePage("blog", pageNumber);

  return (
    <main>
      <ArticleList section="blog" page={page} pageNumber={pageNumber} />
    </main>
  );
}
