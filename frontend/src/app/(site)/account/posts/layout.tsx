import type { ReactNode } from "react";
import PostsLayout from "@/widgets/posts-layout";

/** Раздел «Публикации» с меню справа. */
export default function PostsSectionLayout({ children }: { children: ReactNode }) {
  return <PostsLayout>{children}</PostsLayout>;
}
