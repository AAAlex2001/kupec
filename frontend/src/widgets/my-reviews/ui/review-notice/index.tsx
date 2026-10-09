import type { Review } from "@/entities/review";
import Notice from "@/shared/ui/notice";
import { STATUS_NOTICES } from "../../data";

type ReviewNoticeProps = {
  review: Review;
};

/** Плашка под отзывом: «на проверке» серая, причина отклонения красная. */
const ReviewNotice = ({ review }: ReviewNoticeProps) => {
  if (review.status === "rejected" && review.reject_reason) {
    return <Notice tone="error">Причина отклонения: {review.reject_reason}</Notice>;
  }

  const text = STATUS_NOTICES[review.status];

  return text ? <Notice tone="info">{text}</Notice> : null;
};

export default ReviewNotice;
