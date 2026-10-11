import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEED_PATH } from "@/shared/config/routes";
import { pageNumberFrom, pagePath } from "@/shared/lib/pagination";
import { OG_BASE, OG_COVERS } from "@/shared/lib/seo";
import PostsFeed from "@/widgets/posts-feed";
import { loadFeedPage } from "@/widgets/posts-feed/server";

const TITLE = "Лента публикаций";

const DESCRIPTION =
  "Публикации пользователей «Купца»: новости мастеров, фермеров и продавцов, фото и видео их работ.";

type FeedPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Название, описание и адрес страницы ленты. У каждой ?page свой адрес и заголовок. */
export async function generateMetadata({ searchParams }: FeedPageProps): Promise<Metadata> {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const path = pagePath(FEED_PATH, pageNumber);
  const title = pageNumber > 1 ? `${TITLE} — страница ${pageNumber}` : TITLE;

  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: path },
    openGraph: {
      ...OG_BASE,
      type: "website",
      title,
      description: DESCRIPTION,
      url: path,
      images: [OG_COVERS.posts],
    },
  };
}

/** Лента публикаций всех пользователей, по 20 постов на страницу. Открыта всем, действия — после входа. */
export default async function FeedPage({ searchParams }: FeedPageProps) {
  const pageNumber = pageNumberFrom((await searchParams).page);
  const page = await loadFeedPage(pageNumber);
  if (pageNumber > 1 && page.items.length === 0) notFound();

  return <PostsFeed initial={page} pageNumber={pageNumber} />;
}
