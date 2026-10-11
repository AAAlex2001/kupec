export type SupportPhoto = {
  id: number;
  url: string;
};

export type SupportMessage = {
  id: number;
  from_admin: boolean;
  text: string;
  photos: SupportPhoto[];
  created_at: string;
};

export type SupportThread = {
  messages: SupportMessage[];
};

export type SupportUnread = {
  count: number;
};

export type SupportPerson = {
  id: number;
  name: string | null;
  email: string;
};

export type AdminSupportThread = {
  id: number;
  user: SupportPerson | null;
  preview: string;
  unread_for_admin: boolean;
  last_message_at: string;
};

export type AdminSupportPage = {
  items: AdminSupportThread[];
  total: number;
  unread: number;
};

export type AdminSupportDetail = {
  thread: AdminSupportThread;
  messages: SupportMessage[];
};
