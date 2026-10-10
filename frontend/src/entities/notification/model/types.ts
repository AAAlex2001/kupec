export type NotificationKind = "comment" | "reply" | "like" | "repost" | "follow";

export type Notification = {
  id: number;
  kind: NotificationKind;
  actor: { id: number; name: string | null; avatar_url: string | null };
  post_id: number | null;
  article_path: string | null;
  read: boolean;
  created_at: string;
};

export type NotificationPage = {
  items: Notification[];
  total: number;
};
