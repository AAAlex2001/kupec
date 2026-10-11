"use client";

import { PostCard, usePostView, type Post } from "@/entities/post";
import { useUser } from "@/entities/user";
import { PostMenu } from "@/features/manage-post";
import { PostReactions } from "@/features/react-post";
import AuthorMenu from "../author-menu";

type PostItemProps = {
  post: Post;
  onDeleted: () => void;
  onUnsaved?: () => void;
};

/** Пост с меню «⋯»: у своего — правка и удаление, у чужого — подписка и объявление. У опубликованного — нижняя панель и подсчёт просмотра. */
const PostItem = ({ post, onDeleted, onUnsaved }: PostItemProps) => {
  const { user } = useUser();
  const published = post.status === "published";
  const viewRef = usePostView(post.id, published);
  const own = post.author.id === user?.id;
  const menu = own ? <PostMenu post={post} onDeleted={onDeleted} /> : <AuthorMenu post={post} />;

  return (
    <PostCard
      ref={viewRef}
      post={post}
      menu={menu}
      footer={published && <PostReactions post={post} onUnsaved={onUnsaved} />}
    />
  );
};

export default PostItem;
