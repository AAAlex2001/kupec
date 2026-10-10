import type { Metadata } from "next";
import SavedPosts from "@/widgets/saved-posts";

export const metadata: Metadata = {
  title: "Сохранённое",
};

/** Сохранённые публикации. */
export default function SavedPostsPage() {
  return <SavedPosts />;
}
