import type { CategoryField } from "@/entities/attribute";
import type { Category, Listing } from "@/entities/listing";
import Carousel from "@/shared/ui/carousel";
import Gallery from "@/shared/ui/gallery";
import Notice from "@/shared/ui/notice";
import FeedCard from "@/widgets/feed-card";
import AuthorPanel from "./ui/author-panel";
import ListingDescription from "./ui/listing-description";
import ListingHead from "./ui/listing-head";
import ListingLocation from "./ui/listing-location";
import ListingSpecs from "./ui/listing-specs";
import SellerCard from "./ui/seller-card";
import SellerReviews from "./ui/seller-reviews";
import ViewCounter from "./ui/view-counter";
import styles from "./style.module.scss";

type ListingDetailsProps = {
  listing: Listing;
  categories: Category[];
  fields: CategoryField[];
  sellerListings: Listing[];
  similarListings: Listing[];
};

/** Страница объявления: путь по каталогу, фото, характеристики, описание, место, автор и похожие. */
const ListingDetails = ({
  listing,
  categories,
  fields,
  sellerListings,
  similarListings,
}: ListingDetailsProps) => (
  <div className={styles.page}>
    <ViewCounter listingId={listing.id} />
    <ListingHead listing={listing} categories={categories} />

    {listing.status !== "published" && (
      <Notice tone="info">Объявление не опубликовано — его видите только вы.</Notice>
    )}

    <div className={styles.columns}>
      <div className={styles.main}>
        <Gallery photos={listing.photos.map((photo) => photo.url)} />
        <ListingSpecs listing={listing} fields={fields} />
        {listing.description && <ListingDescription text={listing.description} />}
        {listing.city && <ListingLocation listing={listing} city={listing.city} />}
        <SellerReviews listing={listing} />
      </div>

      <AuthorPanel listing={listing} />
    </div>

    {sellerListings.length > 0 && (
      <Carousel title="Ещё от этого продавца">
        {sellerListings.map((item) => (
          <SellerCard key={item.id} listing={item} />
        ))}
      </Carousel>
    )}

    {similarListings.length > 0 && (
      <Carousel title="Похожие объявления">
        {similarListings.map((item) => (
          <FeedCard key={item.id} listing={item} />
        ))}
      </Carousel>
    )}
  </div>
);

export default ListingDetails;
