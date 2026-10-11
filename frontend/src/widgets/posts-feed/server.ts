import { getFeed } from "@/entities/post/server";
import { sessionHeaders } from "@/entities/user/server";
import { FEED_PAGE_SIZE } from "./data";

/** Страница общей ленты по номеру из ?page= с сервера Next.js, с лайками того, кто смотрит. */
export const loadFeedPage = async (pageNumber: number) => {
  const headers = await sessionHeaders();

  return getFeed(FEED_PAGE_SIZE, (pageNumber - 1) * FEED_PAGE_SIZE, headers ?? undefined);
};
