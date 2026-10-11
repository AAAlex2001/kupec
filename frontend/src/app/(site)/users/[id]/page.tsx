import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getListings } from "@/entities/listing/server";
import { getAuthorPosts } from "@/entities/post/server";
import { getPublicUser, sessionHeaders } from "@/entities/user/server";
import { userPath } from "@/shared/config/routes";
import { OG_BASE, ogImages } from "@/shared/lib/seo";
import AuthorPage from "@/widgets/author-page";

type AuthorRouteProps = {
  params: Promise<{ id: string }>;
};

const SLIDER_LIMIT = 20;

/** Профиль автора с cookie: подписан ли смотрящий. Один запрос на страницу. */
const loadAuthor = cache(async (id: number) => {
  const headers = await sessionHeaders();

  return getPublicUser(id, headers ?? undefined);
});

/** Публикации и объявления автора. Один запрос на страницу — и для метаданных, и для самой страницы. */
const loadContent = cache(async (id: number) => {
  const headers = await sessionHeaders();
  const [posts, listings] = await Promise.all([
    getAuthorPosts(id, SLIDER_LIMIT, headers ?? undefined),
    getListings({ owner: id, limit: SLIDER_LIMIT }),
  ]);

  return { posts: posts.items, listings: listings.items };
});

/** Имя, описание и аватар автора. Страница без публикаций и объявлений не индексируется: на ней нечего искать. */
export async function generateMetadata({ params }: AuthorRouteProps): Promise<Metadata> {
  const id = Number((await params).id);
  const [author, content] = await Promise.all([loadAuthor(id), loadContent(id)]);
  if (!author) return { title: "Пользователь не найден", robots: { index: false } };

  const title = author.name ?? "Пользователь";
  const place = author.city ? ` из ${author.city.name}` : "";
  const description = `${title}${place} на «Купце»: публикации и объявления.`;
  const empty = content.posts.length === 0 && content.listings.length === 0;

  return {
    title,
    description,
    alternates: { canonical: userPath(author.id) },
    robots: { index: !empty },
    openGraph: {
      ...OG_BASE,
      type: "profile",
      title,
      description,
      url: userPath(author.id),
      images: ogImages(author.avatar_url),
    },
  };
}

/** Страница автора: его публикации и объявления. */
export default async function AuthorRoute({ params }: AuthorRouteProps) {
  const id = Number((await params).id);
  const [author, content] = await Promise.all([loadAuthor(id), loadContent(id)]);
  if (!author) notFound();

  return (
    <main>
      <AuthorPage author={author} posts={content.posts} listings={content.listings} />
    </main>
  );
}
