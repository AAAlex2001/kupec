import type { RepostedPost } from "../../model/types";
import PostContent from "../post-content";
import PostHead from "../post-head";
import styles from "./style.module.scss";

type OriginalPostProps = {
  post: RepostedPost;
};

/** Репостнутая публикация в рамке: автор, дата и содержимое. */
const OriginalPost = ({ post }: OriginalPostProps) => (
  <div className={styles.original}>
    <PostHead author={post.author} date={post.published_at ?? post.created_at} />
    <PostContent html={post.html} media={post.media} listings={post.listings} />
  </div>
);

export default OriginalPost;
