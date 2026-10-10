import Image from "next/image";
import Link from "next/link";
import { postPath } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/format";
import { HeartIcon, MessageCircleIcon } from "@/shared/ui/icons";
import { postCover } from "../../lib/cover";
import type { Post } from "../../model/types";
import styles from "./style.module.scss";

type PostPreviewProps = {
  post: Post;
};

/** Превью поста для слайдера: обложка, текст в три строки, дата, лайки и комментарии. Ведёт на пост. */
const PostPreview = ({ post }: PostPreviewProps) => {
  const cover = postCover(post);
  const html = post.html || post.repost_of?.html || "";

  return (
    <Link className={styles.preview} href={postPath(post.id)}>
      {cover && (
        <div className={styles.cover}>
          <Image className={styles.image} src={cover} alt="" fill sizes="270px" unoptimized />
        </div>
      )}

      {html && <div className={styles.text} dangerouslySetInnerHTML={{ __html: html }} />}

      <div className={styles.meta}>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
        <span className={styles.counts}>
          <HeartIcon className={styles.icon} />
          {post.likes_count}
          <MessageCircleIcon className={styles.icon} />
          {post.comments_count}
        </span>
      </div>
    </Link>
  );
};

export default PostPreview;
