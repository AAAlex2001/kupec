import { load } from "@/shared/api/server";
import type { Post, PostPage } from "../model/types";

const EMPTY_PAGE: PostPage = { items: [], total: 0 };

/** Страница общей ленты с сервера Next.js. С cookie — с лайками и закладками смотрящего. */
export const getFeed = (limit: number, offset: number, headers?: HeadersInit) =>
  load<PostPage>(`/v1/posts/feed?limit=${limit}&offset=${offset}`, EMPTY_PAGE, headers);

/** Опубликованные посты автора с сервера Next.js. С cookie — с лайками и закладками смотрящего. */
export const getAuthorPosts = (authorId: number, limit: number, headers?: HeadersInit) =>
  load<PostPage>(`/v1/posts/author/${authorId}?limit=${limit}`, EMPTY_PAGE, headers);

/** Пост с сервера Next.js: опубликованный — всем, свой черновик — автору. Нет — null. */
export const getPost = (id: number, headers?: HeadersInit) =>
  load<Post | null>(`/v1/posts/${id}`, null, headers);
