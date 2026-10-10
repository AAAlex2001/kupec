"use client";

import cn from "classnames";
import type { Article } from "@/entities/article";
import Button from "@/shared/ui/button";
import { HeartIcon, MessageCircleIcon, ShareIcon } from "@/shared/ui/icons";
import Notice from "@/shared/ui/notice";
import { useArticleReactions } from "../../model/use-article-reactions";
import styles from "./style.module.scss";

type ArticleReactionsProps = {
  article: Article;
  commentsHref: string;
};

/** Панель под статьёй: лайк, комментарии — к обсуждению ниже, и «Поделиться». */
const ArticleReactions = ({ article, commentsHref }: ArticleReactionsProps) => {
  const reactions = useArticleReactions(article);
  const likeLabel = reactions.liked ? "Убрать лайк" : "Нравится";

  return (
    <div className={styles.reactions}>
      <div className={styles.panel}>
        <div className={styles.group}>
          <Button
            variant="tool"
            className={cn(reactions.liked && styles.liked)}
            ariaLabel={likeLabel}
            onClick={reactions.toggleLike}
          >
            <HeartIcon />
            <span className={styles.count}>{reactions.likes}</span>
          </Button>

          <Button variant="tool" ariaLabel="Комментарии" href={commentsHref}>
            <MessageCircleIcon />
            <span className={styles.count}>{article.comments_count}</span>
          </Button>
        </div>

        <Button variant="tool" ariaLabel="Поделиться" onClick={reactions.share}>
          <ShareIcon />
        </Button>
      </div>

      {reactions.notice && <Notice tone="info">{reactions.notice}</Notice>}
      {reactions.error && <Notice tone="error">{reactions.error}</Notice>}
    </div>
  );
};

export default ArticleReactions;
