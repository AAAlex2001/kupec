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

/** Имя, описание и аватар автора для поисковиков и превью ссылки. */
export async function generateMetadata({ params }: AuthorRouteProps): Promise<Metadata> {
  const author = await loadAuthor(Number((await params).id));
  if (!author) return { title: "Пользователь не найден", robots: { index: false } };

  const title = author.name ?? "Пользователь";
  const place = author.city ? ` из ${author.city.name}` : "";
  const description = `${title}${place} на «Купце»: публикации и объявления.`;

  return {
    title,
    description,
    alternates: { canonical: userPath(author.id) },
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
  const author = await loadAuthor(id);
  if (!author) notFound();

  const headers = await sessionHeaders();
  const [posts, listings] = await Promise.all([
    getAuthorPosts(id, SLIDER_LIMIT, headers ?? undefined),
    getListings({ owner: id, limit: SLIDER_LIMIT }),
  ]);

  return (
    <main>
      <AuthorPage author={author} posts={posts.items} listings={listings.items} />
    </main>
  );
}
