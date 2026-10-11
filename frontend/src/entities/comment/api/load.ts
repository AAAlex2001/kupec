import { load } from "@/shared/api/server";
import type { CommentTarget, ThreadPage } from "../model/types";

const EMPTY_PAGE: ThreadPage = { items: [], total: 0, comments_count: 0 };

/** Первая страница веток комментариев поста или статьи с сервера Next.js. С cookie — с лайками смотрящего. */
export const getThreads = (target: CommentTarget, limit: number, headers?: HeadersInit) =>
  load<ThreadPage>(`/v1/${target.kind}/${target.id}/comments?limit=${limit}&offset=0`, EMPTY_PAGE, headers);
