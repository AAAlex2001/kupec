import { jsonBody, request } from "@/shared/api";
import type {
  Comment,
  CommentLikes,
  CommentPayload,
  CommentTarget,
  ThreadPage,
} from "../model/types";

/** Адрес комментариев поста или статьи: /v1/posts/5/comments или /v1/articles/7/comments. */
const commentsUrl = (target: CommentTarget) => `/v1/${target.kind}/${target.id}/comments`;

/** Страница веток комментариев: корневой комментарий и ответы в нём. */
export const fetchThreads = (target: CommentTarget, limit: number, offset: number) =>
  request<ThreadPage>(`${commentsUrl(target)}?limit=${limit}&offset=${offset}`);

/** Написать комментарий или ответ. */
export const createComment = (target: CommentTarget, payload: CommentPayload) =>
  request<Comment>(commentsUrl(target), jsonBody("POST", payload));

/** Изменить текст своего комментария. */
export const updateComment = (id: number, text: string) =>
  request<Comment>(`/v1/posts/comments/${id}`, jsonBody("PUT", { text }));

/** Удалить свой комментарий вместе с ответами. */
export const deleteComment = (id: number) =>
  request<void>(`/v1/posts/comments/${id}`, { method: "DELETE" });

/** Пожаловаться на комментарий: причина уходит модератору. */
export const reportComment = (id: number, reason: string) =>
  request<void>(`/v1/posts/comments/${id}/report`, jsonBody("POST", { reason }));

/** Поставить или убрать лайк комментарию. */
export const toggleCommentLike = (id: number, liked: boolean) =>
  request<CommentLikes>(`/v1/posts/comments/${id}/like`, { method: liked ? "POST" : "DELETE" });
