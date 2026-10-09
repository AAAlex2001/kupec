import type { Metadata } from "next";
import MyReviews from "@/widgets/my-reviews";

export const metadata: Metadata = {
  title: "Мои отзывы",
};

/** Отзывы, которые оставил пользователь. */
export default function ReviewsPage() {
  return <MyReviews />;
}
