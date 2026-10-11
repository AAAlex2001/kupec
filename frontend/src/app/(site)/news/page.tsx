import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionMetadata } from "@/entities/article";
import { pageNumberFrom } from "@/shared/lib/pagination";
import ArticleList, { loadArticlePage } from "@/widgets/article-list";

type NewsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Название, описание и адрес страницы раздела «Новости». */
export async function generateMetadata({ searchParams }: NewsPageProps): Promise<Metadata> {
  return sectionMetadata("news", pageNumberFrom((await searchParams).page));
}

/** Раздел «Новости»: по 12 статей на страницу, новые первыми. Пустая страница после последней — 404. */
export default async function NewsPage({ searchParams }: NewsPageProps) {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const page = await loadArticlePage("news", pageNumber);
  if (pageNumber > 1 && page.items.length === 0) notFound();

  return (
    <main>
      <ArticleList section="news" page={page} pageNumber={pageNumber} />
    </main>
  );
}
