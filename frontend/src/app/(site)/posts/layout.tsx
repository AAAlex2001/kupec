import type { ReactNode } from "react";
import Account from "@/widgets/account";
import PostsLayout from "@/widgets/posts-layout";

/** Лента и страницы постов — открыты всем. Вошедшему — с меню кабинета слева, гостю — без него. */
export default function PublicPostsLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <Account guest={<PostsLayout standalone>{children}</PostsLayout>}>
        <PostsLayout>{children}</PostsLayout>
      </Account>
    </main>
  );
}
