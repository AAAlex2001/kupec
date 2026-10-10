import type { Metadata } from "next";
import MyPosts from "@/widgets/my-posts";

export const metadata: Metadata = {
  title: "Мои публикации",
};

/** Посты пользователя. */
export default function PostsPage() {
  return <MyPosts />;
}
