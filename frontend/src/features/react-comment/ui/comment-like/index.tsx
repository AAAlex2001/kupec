"use client";

import cn from "classnames";
import type { Comment } from "@/entities/comment";
import Button from "@/shared/ui/button";
import { HeartIcon } from "@/shared/ui/icons";
import { useCommentLike } from "../../model/use-comment-like";
import styles from "./style.module.scss";

type CommentLikeProps = {
  comment: Comment;
};

/** «Нравится» под комментарием: сердце краснеет, рядом число лайков. */
const CommentLike = ({ comment }: CommentLikeProps) => {
  const like = useCommentLike(comment);

  return (
    <>
      <Button variant="secondary" className={cn(like.liked && styles.liked)} onClick={like.toggle}>
        <HeartIcon />
        Нравится
        {like.likes > 0 && <span className={styles.count}>{like.likes}</span>}
      </Button>

      {like.error && <span className={styles.error}>{like.error}</span>}
    </>
  );
};

export default CommentLike;
