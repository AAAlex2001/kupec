"use client";

import cn from "classnames";
import type { Post } from "@/entities/post";
import { postCommentsPath, repostPath } from "@/shared/config/routes";
import ActionMenu, { type MenuAction } from "@/shared/ui/action-menu";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import {
  BookmarkIcon,
  HeartIcon,
  MessageCircleIcon,
  PencilIcon,
  RepostIcon,
  ShareIcon,
} from "@/shared/ui/icons";
import { usePostReactions } from "../../model/use-post-reactions";
import styles from "./style.module.scss";

type PostReactionsProps = {
  post: Post;
  onUnsaved?: () => void;
};

/** Нижняя панель поста во всю ширину: лайк, комментарии — к комментариям на странице поста, репост, «Сохранить» и «Поделиться». */
const PostReactions = ({ post, onUnsaved }: PostReactionsProps) => {
  const reactions = usePostReactions(post, onUnsaved);

  const commentRepost: MenuAction = reactions.signedIn
    ? { label: "Репост с комментарием", Icon: PencilIcon, href: repostPath(post.id) }
    : { label: "Репост с комментарием", Icon: PencilIcon, onClick: reactions.openAuth };

  return (
    <div className={styles.reactions}>
      <div className={styles.panel}>
        <Button
          variant="tool"
          className={cn(reactions.liked && styles.liked)}
          ariaLabel={reactions.liked ? "Убрать лайк" : "Нравится"}
          onClick={reactions.toggleLike}
        >
          <HeartIcon />
          <span className={styles.count}>{reactions.likes}</span>
        </Button>

        <Button variant="tool" ariaLabel="Комментарии" href={postCommentsPath(post.id)}>
          <MessageCircleIcon />
          <span className={styles.count}>{post.comments_count}</span>
        </Button>

        <ActionMenu
          ariaLabel="Репост"
          trigger={
            <>
              <RepostIcon />
              <span className={styles.count}>{reactions.reposts}</span>
            </>
          }
          actions={[{ label: "Репостнуть", Icon: RepostIcon, onClick: reactions.repost }, commentRepost]}
        />

        <Button
          variant="tool"
          className={cn(reactions.saved && styles.saved)}
          ariaLabel={reactions.saved ? "Убрать из сохранённого" : "Сохранить"}
          onClick={reactions.toggleSave}
        >
          <BookmarkIcon />
        </Button>

        <Button variant="tool" ariaLabel="Поделиться" onClick={reactions.share}>
          <ShareIcon />
        </Button>
      </div>

      {reactions.notice && <Notice tone="info">{reactions.notice}</Notice>}
      {reactions.error && <Notice tone="error">{reactions.error}</Notice>}
    </div>
  );
};

export default PostReactions;
