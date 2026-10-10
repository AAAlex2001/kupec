import type { ReactNode } from "react";
import type { Post } from "../../model/types";
import OriginalPost from "../original-post";
import PostContent from "../post-content";
import PostHead from "../post-head";
import styles from "./style.module.scss";

type PostCardProps = {
  post: Post;
  menu?: ReactNode;
  footer?: ReactNode;
};

/** Карточка поста: шапка, содержимое, у репоста — оригинал в рамке. Меню «⋯» и нижняя панель — слоты. */
const PostCard = ({ post, menu, footer }: PostCardProps) => (
  <article className={styles.card}>
    <PostHead
      author={post.author}
      date={post.published_at ?? post.created_at}
      note={post.repost_of ? "репост" : undefined}
      menu={menu}
    />

    <PostContent html={post.html} media={post.media} listings={post.listings} />
    {post.repost_of && <OriginalPost post={post.repost_of} />}

    {footer}
  </article>
);

export default PostCard;
