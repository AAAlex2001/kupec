import type { Metadata } from "next";
import { FEED_PATH } from "@/shared/config/routes";
import { OG_BASE } from "@/shared/lib/seo";
import PostsFeed from "@/widgets/posts-feed";

const DESCRIPTION =
  "Публикации пользователей «Купца»: новости мастеров, фермеров и продавцов, фото и видео их работ.";

export const metadata: Metadata = {
  title: "Лента публикаций",
  description: DESCRIPTION,
  alternates: { canonical: FEED_PATH },
  openGraph: { ...OG_BASE, title: "Лента публикаций", description: DESCRIPTION, url: FEED_PATH },
};

/** Лента публикаций всех пользователей. Открыта всем, действия — после входа. */
export default function FeedPage() {
  return <PostsFeed />;
}
