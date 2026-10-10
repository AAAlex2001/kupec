import Gallery from "@/shared/ui/gallery";
import MediaView from "@/shared/ui/media-view";
import type { AttachedListing, PostMedia } from "../../model/types";
import PostListing from "../post-listing";
import styles from "./style.module.scss";

type PostContentProps = {
  html: string;
  media: PostMedia[];
  listings: AttachedListing[];
};

/** Содержимое поста: текст, фото галереей как в объявлении, видео во всю ширину и объявления.
 *
 * HTML поста сервер очищает при сохранении, поэтому его можно вставить как есть.
 */
const PostContent = ({ html, media, listings }: PostContentProps) => {
  const photos = media.filter((item) => item.kind === "photo").map((item) => item.url);
  const videos = media.filter((item) => item.kind === "video");

  return (
    <>
      {html && <div className={styles.text} dangerouslySetInnerHTML={{ __html: html }} />}

      {photos.length > 0 && <Gallery photos={photos} />}

      {videos.map((item) => (
        <div key={item.id} className={styles.video}>
          <MediaView url={item.url} video />
        </div>
      ))}

      {listings.map((listing) => (
        <PostListing key={listing.id} listing={listing} />
      ))}
    </>
  );
};

export default PostContent;
