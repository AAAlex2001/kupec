export type ArticleSection = "blog" | "news";

export type ArticleStatus = "draft" | "published";

export type ArticleCard = {
  id: number;
  section: ArticleSection;
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  published_at: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
};

export type Article = ArticleCard & {
  html: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  updated_at: string;
  liked: boolean;
};

export type ArticleLikes = {
  likes_count: number;
  liked: boolean;
};

export type AdminArticle = Article & {
  status: ArticleStatus;
  created_at: string;
};

export type ArticlePage = {
  items: ArticleCard[];
  total: number;
};

export type AdminArticlePage = {
  items: AdminArticle[];
  total: number;
};

export type ArticlePayload = {
  section: ArticleSection;
  slug: string;
  title: string;
  description: string;
  html: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  publish: boolean;
};
