import type { Metadata } from "next";
import { AccountEmpty } from "@/widgets/account";

export const metadata: Metadata = {
  title: "Мои отзывы",
};

/** Отзывы, которые оставил пользователь. */
export default function MyReviewsPage() {
  return <AccountEmpty section="reviews" />;
}
