import { load } from "@/shared/api/server";
import { SELLER_REVIEWS_PAGE_SIZE } from "../model/config";
import type { ReviewPage } from "../model/types";

const EMPTY_PAGE: ReviewPage = { items: [], total: 0 };

/** Первые опубликованные отзывы о продавце с сервера Next.js — чтобы они были в HTML для поисковиков. */
export const getSellerReviews = (sellerId: number) =>
  load<ReviewPage>(`/v1/reviews/seller/${sellerId}?limit=${SELLER_REVIEWS_PAGE_SIZE}&offset=0`, EMPTY_PAGE);
