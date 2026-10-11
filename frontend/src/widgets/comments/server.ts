import type { CommentTarget } from "@/entities/comment";
import { getThreads } from "@/entities/comment/server";
import { sessionHeaders } from "@/entities/user/server";
import { COMMENTS_PAGE_SIZE } from "./config";

/** Первые ветки обсуждения с сервера Next.js, чтобы комментарии были в HTML для поисковиков. */
export const loadComments = async (target: CommentTarget) => {
  const headers = await sessionHeaders();

  return getThreads(target, COMMENTS_PAGE_SIZE, headers ?? undefined);
};
