import type { Metadata } from "next";
import NewPost from "@/widgets/post-editor";

export const metadata: Metadata = {
  title: "Новая публикация",
};

/** Создание поста. */
export default function NewPostPage() {
  return <NewPost />;
}
