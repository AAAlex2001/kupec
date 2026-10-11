import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionMetadata } from "@/entities/article";
import { pageNumberFrom } from "@/shared/lib/pagination";
import ArticleList, { loadArticlePage } from "@/widgets/article-list";

type BlogPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Название, описание и адрес страницы раздела «Блог». */
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  return sectionMetadata("blog", pageNumberFrom((await searchParams).page));
}

/** Раздел «Блог»: по 12 статей на страницу, новые первыми. Пустая страница после последней — 404. */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const page = await loadArticlePage("blog", pageNumber);
  if (pageNumber > 1 && page.items.length === 0) notFound();

  return (
    <main>
      <ArticleList section="blog" page={page} pageNumber={pageNumber} />
    </main>
  );
}
