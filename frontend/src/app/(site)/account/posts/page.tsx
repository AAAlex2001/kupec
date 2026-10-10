import { redirect } from "next/navigation";
import { FEED_PATH } from "@/shared/config/routes";

/** Вход в «Публикации» кабинета ведёт в ленту. */
export default function PostsPage() {
  redirect(FEED_PATH);
}
