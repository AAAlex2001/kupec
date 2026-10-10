import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { postCover, postDescription, postTitle } from "@/entities/post";
import { getPost } from "@/entities/post/server";
import { sessionHeaders } from "@/entities/user/server";
import { postPath } from "@/shared/config/routes";
import { OG_BASE, ogImages } from "@/shared/lib/seo";
import PostPage from "@/widgets/post-page";

type PostRouteProps = {
  params: Promise<{ id: string }>;
};

/** Пост с cookie: автор видит и свой черновик. Один запрос на страницу. */
const loadPost = cache(async (id: number) => {
  const headers = await sessionHeaders();

  return getPost(id, headers ?? undefined);
});

/** Заголовок, описание, картинка для превью ссылки и адрес страницы. Черновик не индексируется. */
export async function generateMetadata({ params }: PostRouteProps): Promise<Metadata> {
  const post = await loadPost(Number((await params).id));
  if (!post) return { title: "Публикация не найдена", robots: { index: false } };

  const title = postTitle(post);
  const description = postDescription(post);
  const cover = postCover(post);

  return {
    title,
    description,
    alternates: { canonical: postPath(post.id) },
    robots: { index: post.status === "published" },
    openGraph: {
      ...OG_BASE,
      type: "article",
      title,
      description,
      url: postPath(post.id),
      publishedTime: post.published_at ?? undefined,
      authors: post.author.name ? [post.author.name] : undefined,
      images: ogImages(cover),
    },
  };
}

/** Публикация с комментариями. Открыта всем. */
export default async function PostRoute({ params }: PostRouteProps) {
  const post = await loadPost(Number((await params).id));
  if (!post) notFound();

  return <PostPage post={post} />;
}
