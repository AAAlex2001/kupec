/** К чему комментарии: к посту или к статье блога и новостей. */
export type CommentTarget = {
  kind: "posts" | "articles";
  id: number;
};

export type Comment = {
  id: number;
  author: { id: number; name: string | null; avatar_url: string | null };
  text: string;
  parent_id: number | null;
  reply_to_name: string | null;
  likes_count: number;
  liked: boolean;
  created_at: string;
};

export type Thread = {
  comment: Comment;
  replies: Comment[];
};

export type ThreadPage = {
  items: Thread[];
  total: number;
  comments_count: number;
};

export type CommentPayload = {
  text: string;
  reply_to_id: number | null;
};

export type CommentLikes = {
  likes_count: number;
  liked: boolean;
};
