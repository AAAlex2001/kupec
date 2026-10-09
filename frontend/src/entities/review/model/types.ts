import type { City } from "@/entities/city";

export type ReviewStatus = "pending" | "published" | "rejected";

export type ReviewPhoto = {
  id: number;
  url: string;
};

export type ReviewListing = {
  id: number;
  title: string;
  cover_url: string | null;
  city: City | null;
  address: string | null;
};

export type Review = {
  id: number;
  listing: ReviewListing | null;
  seller: { id: number; name: string | null };
  author_name: string;
  rating: number;
  text: string | null;
  anonymous: boolean;
  status: ReviewStatus;
  reject_reason: string | null;
  photos: ReviewPhoto[];
  reply_text: string | null;
  reply_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewCounts = Record<ReviewStatus, number>;

export type ReviewList = {
  items: Review[];
  counts: ReviewCounts;
};

export type ReviewPage = {
  items: Review[];
  total: number;
};

export type AdminReviewPage = ReviewPage & {
  counts: ReviewCounts;
};

export type ReviewableListing = {
  id: number;
  title: string;
  cover_url: string | null;
  owner: { id: number; name: string | null };
  city: City | null;
};

export type ReviewPayload = {
  rating: number;
  text: string | null;
  anonymous: boolean;
  photo_ids: number[];
};
