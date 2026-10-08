import type { ListingStatus } from "@/entities/listing";

export type Companion = {
  id: number;
  name: string | null;
  avatar_url: string | null;
};

export type ConversationListing = {
  id: number;
  title: string;
  status: ListingStatus;
  price: string | null;
  unit_label: string | null;
  cover_url: string | null;
};

export type Conversation = {
  id: number;
  listing: ConversationListing;
  companion: Companion;
  last_message_text: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
};

export type Message = {
  id: number;
  sender_id: number;
  text: string;
  created_at: string;
  read_at: string | null;
};

export type ConversationDetail = {
  conversation: Conversation;
  messages: Message[];
  blocked_by_me: boolean;
  blocked_me: boolean;
};
