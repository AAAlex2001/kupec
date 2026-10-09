import type { ReviewStatus } from "@/entities/review";

export const TABS: { value: ReviewStatus; label: string }[] = [
  { value: "published", label: "Опубликованные" },
  { value: "pending", label: "На проверке" },
  { value: "rejected", label: "Отклонённые" },
];

export const STATUS_NOTICES: Partial<Record<ReviewStatus, string>> = {
  pending: "Отзыв отправлен на проверку. Он появится в профиле автора после модерации.",
};
