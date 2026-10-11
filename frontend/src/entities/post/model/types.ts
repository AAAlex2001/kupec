export type PostStatus = "draft" | "published" | "hidden";

export type PostMedia = {
  id: number;
  kind: "photo" | "video";
  url: string;
};

export type AttachedListing = {
  id: number;
  title: string;
  price: string | null;
  unit_label: string | null;
  cover_url: string | null;
  status: "draft" | "published" | "archived";
  category: { name: string } | null;
};

export type PostAuthor = {
  id: number;
  name: string | null;
  avatar_url: string | null;
};

export type RepostedPost = {
  id: number;
  author: PostAuthor;
  html: string;
  media: PostMedia[];
  listings: AttachedListing[];
  created_at: string;
  published_at: string | null;
};

export type Post = {
  id: number;
  author: PostAuthor;
  html: string;
  media: PostMedia[];
  listings: AttachedListing[];
  repost_of: RepostedPost | null;
  status: PostStatus;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count: number;
  telegram_url: string | null;
  liked: boolean;
  saved: boolean;
  following: boolean;
  created_at: string;
  published_at: string | null;
};

export type PostPage = {
  items: Post[];
  total: number;
};

export type PostCounts = Record<PostStatus, number>;

export type PostPayload = {
  html: string;
  media_ids: number[];
  listing_ids: number[];
  draft: boolean;
  telegram: boolean;
};

export type PostLikes = {
  likes_count: number;
  liked: boolean;
};

export type AdminPostPage = PostPage & {
  counts: PostCounts;
};

export type ReportStatus = "open" | "resolved";

export type ReportedComment = {
  id: number;
  author: PostAuthor;
  text: string;
  created_at: string;
};

export type Report = {
  id: number;
  reporter: PostAuthor;
  post: Post | null;
  comment: ReportedComment | null;
  reason: string;
  status: ReportStatus;
  created_at: string;
};

export type ReportPage = {
  items: Report[];
  total: number;
  counts: Record<ReportStatus, number>;
};
