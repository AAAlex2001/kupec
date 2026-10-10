import { jsonBody, request } from "@/shared/api";
import type {
  Post,
  PostCounts,
  PostLikes,
  PostMedia,
  PostPage,
  PostPayload,
  PostStatus,
} from "../model/types";

/** Лента: опубликованные посты всех авторов. */
export const fetchFeed = (limit: number, offset: number) =>
  request<PostPage>(`/v1/posts/feed?limit=${limit}&offset=${offset}`);

/** Лента «Подписки»: посты авторов, на которых вы подписаны. */
export const fetchFollowingFeed = (limit: number, offset: number) =>
  request<PostPage>(`/v1/posts/feed/following?limit=${limit}&offset=${offset}`);

/** Сколько новых постов в подписках с прошлого захода во вкладку. */
export const fetchFollowingUnseen = () =>
  request<{ count: number }>("/v1/posts/feed/following/unseen");

/** Отметить вкладку «Подписки» просмотренной. */
export const markFollowingSeen = () =>
  request<void>("/v1/posts/feed/following/seen", { method: "POST" });

/** Свои репосты. */
export const fetchMyReposts = (limit: number, offset: number) =>
  request<PostPage>(`/v1/posts/reposts?limit=${limit}&offset=${offset}`);

/** Репостнуть публикацию: html пустой — простой репост, иначе с комментарием. */
export const repostPost = (id: number, html: string) =>
  request<Post>(`/v1/posts/${id}/repost`, jsonBody("POST", { html }));

/** Пожаловаться на пост: причина уходит модератору. */
export const reportPost = (id: number, reason: string) =>
  request<void>(`/v1/posts/${id}/report`, jsonBody("POST", { reason }));

/** Сохранённые посты. */
export const fetchSavedPosts = (limit: number, offset: number) =>
  request<PostPage>(`/v1/posts/saved?limit=${limit}&offset=${offset}`);

/** Свои посты на вкладке. */
export const fetchMyPosts = (status: PostStatus, limit: number, offset: number) =>
  request<PostPage>(`/v1/posts/my?status=${status}&limit=${limit}&offset=${offset}`);

/** Сколько своих постов опубликовано и в черновиках. */
export const fetchMyPostCounts = () => request<PostCounts>("/v1/posts/my/counts");

/** Пост по id: опубликованный или свой черновик. */
export const fetchPost = (id: number) => request<Post>(`/v1/posts/${id}`);

/** Опубликовать пост или сохранить черновиком. */
export const createPost = (payload: PostPayload) =>
  request<Post>("/v1/posts", jsonBody("POST", payload));

/** Изменить свой пост. */
export const updatePost = (id: number, payload: PostPayload) =>
  request<Post>(`/v1/posts/${id}`, jsonBody("PUT", payload));

/** Удалить свой пост. */
export const deletePost = (id: number) => request<void>(`/v1/posts/${id}`, { method: "DELETE" });

/** Поставить или убрать лайк. */
export const togglePostLike = (id: number, liked: boolean) =>
  request<PostLikes>(`/v1/posts/${id}/like`, { method: liked ? "POST" : "DELETE" });

/** Сохранить пост себе или убрать из сохранённого. */
export const togglePostSave = (id: number, saved: boolean) =>
  request<void>(`/v1/posts/${id}/save`, { method: saved ? "POST" : "DELETE" });

/** Загрузить фото или видео для поста. Вид файла — по его типу. */
export const uploadPostMedia = (file: File) => {
  const kind = file.type.startsWith("video/") ? "video" : "photo";
  const body = new FormData();
  body.append("file", file);

  return request<PostMedia>(`/v1/posts/media?kind=${kind}`, { method: "POST", body });
};

/** Удалить загруженный файл, пока он не привязан к посту. */
export const deletePostMedia = (mediaId: number) =>
  request<void>(`/v1/posts/media/${mediaId}`, { method: "DELETE" });
