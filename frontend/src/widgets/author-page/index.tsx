import type { Listing } from "@/entities/listing";
import { PostPreview, type Post } from "@/entities/post";
import type { PublicUser } from "@/entities/user";
import Carousel from "@/shared/ui/carousel";
import FeedCard from "@/widgets/feed-card";
import AuthorHeader from "./ui/author-header";
import styles from "./style.module.scss";

type AuthorPageProps = {
  author: PublicUser;
  posts: Post[];
  listings: Listing[];
};

/** Страница автора: шапка с подпиской, слайдер превью его публикаций и слайдер объявлений. */
const AuthorPage = ({ author, posts, listings }: AuthorPageProps) => (
  <div className={styles.page}>
    <AuthorHeader author={author} />

    {posts.length > 0 && (
      <Carousel title="Публикации">
        {posts.map((post) => (
          <PostPreview key={post.id} post={post} />
        ))}
      </Carousel>
    )}

    {listings.length > 0 && (
      <Carousel title="Объявления">
        {listings.map((listing) => (
          <FeedCard key={listing.id} listing={listing} />
        ))}
      </Carousel>
    )}

    {posts.length === 0 && listings.length === 0 && (
      <p className={styles.empty}>У автора пока нет публикаций и объявлений.</p>
    )}
  </div>
);

export default AuthorPage;
