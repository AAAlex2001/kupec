import type { Metadata } from "next";
import { pageNumberFrom, sectionMetadata } from "@/entities/article";
import ArticleList, { loadArticlePage } from "@/widgets/article-list";

type NewsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Название, описание и адрес страницы раздела «Новости». */
export async function generateMetadata({ searchParams }: NewsPageProps): Promise<Metadata> {
  return sectionMetadata("news", pageNumberFrom((await searchParams).page));
}

/** Раздел «Новости»: статьи по 12 на страницу, новые первыми. */
export default async function NewsPage({ searchParams }: NewsPageProps) {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const page = await loadArticlePage("news", pageNumber);

  return (
    <main>
      <ArticleList section="news" page={page} pageNumber={pageNumber} />
    </main>
  );
}
