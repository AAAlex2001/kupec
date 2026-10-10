"use client";

import { useRouter } from "next/navigation";
import { postJsonLd, type Post } from "@/entities/post";
import { COMMENTS_ANCHOR, FEED_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import { ArrowLeftIcon } from "@/shared/ui/icons";
import JsonLd from "@/shared/ui/json-ld";
import Title from "@/shared/ui/title";
import Comments from "@/widgets/comments";
import { PostItem } from "@/widgets/post-list";
import styles from "./style.module.scss";

type PostPageProps = {
  post: Post;
};

/** Страница публикации: «Назад в ленту», пост и комментарии к нему. Разметка schema.org — для поисковиков. */
const PostPage = ({ post }: PostPageProps) => {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <JsonLd data={postJsonLd(post)} />

      <Button variant="secondary" href={FEED_PATH}>
        <ArrowLeftIcon />
        Назад в ленту
      </Button>

      <Title as="h1">Публикация</Title>

      <PostItem post={post} onDeleted={() => router.push(FEED_PATH)} />
      <Comments
        id={COMMENTS_ANCHOR}
        target={{ kind: "posts", id: post.id }}
        count={post.comments_count}
      />
    </div>
  );
};

export default PostPage;
