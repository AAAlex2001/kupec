import { request } from "@/shared/api";
import type { ArticleLikes } from "../model/types";

/** Поставить или убрать лайк статье. */
export const toggleArticleLike = (id: number, liked: boolean) =>
  request<ArticleLikes>(`/v1/articles/${id}/like`, { method: liked ? "POST" : "DELETE" });
