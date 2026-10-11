import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { articleMetadata } from "@/entities/article";
import { getArticle } from "@/entities/article/server";
import { sessionHeaders } from "@/entities/user/server";
import ArticlePage, { loadRelated } from "@/widgets/article-page";
import { loadComments } from "@/widgets/comments/server";

type NewsArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

/** Новость по адресу. Один запрос на страницу. */
const loadArticle = cache(async (slug: string) => {
  const headers = await sessionHeaders();
  return getArticle("news", slug, headers ?? undefined);
});

/** Заголовок, описание, ключевые запросы и превью новости. */
export async function generateMetadata({ params }: NewsArticleRouteProps): Promise<Metadata> {
  const article = await loadArticle((await params).slug);
  if (!article) return { title: "Статья не найдена", robots: { index: false } };

  return articleMetadata(article);
}

/** Новость целиком и «Читайте также». */
export default async function NewsArticleRoute({ params }: NewsArticleRouteProps) {
  const article = await loadArticle((await params).slug);
  if (!article) notFound();

  const [related, comments] = await Promise.all([
    loadRelated(article),
    loadComments({ kind: "articles", id: article.id }),
  ]);

  return (
    <main>
      <ArticlePage article={article} related={related} comments={comments} />
    </main>
  );
}
