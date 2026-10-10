"use client";

import { PostCard, type Post } from "@/entities/post";
import { useUser } from "@/entities/user";
import { PostMenu } from "@/features/manage-post";
import { PostReactions } from "@/features/react-post";
import AuthorMenu from "../author-menu";

type PostItemProps = {
  post: Post;
  onDeleted: () => void;
  onUnsaved?: () => void;
};

/** Пост с меню «⋯»: у своего — правка и удаление, у чужого — подписка и объявление. У опубликованного — нижняя панель. */
const PostItem = ({ post, onDeleted, onUnsaved }: PostItemProps) => {
  const { user } = useUser();
  const own = post.author.id === user?.id;
  const menu = own ? <PostMenu post={post} onDeleted={onDeleted} /> : <AuthorMenu post={post} />;

  return (
    <PostCard
      post={post}
      menu={menu}
      footer={post.status === "published" && <PostReactions post={post} onUnsaved={onUnsaved} />}
    />
  );
};

export default PostItem;
