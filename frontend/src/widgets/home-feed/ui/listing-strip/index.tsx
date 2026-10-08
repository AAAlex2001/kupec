import type { Listing } from "@/entities/listing";
import Carousel from "@/shared/ui/carousel";
import FeedCard from "@/widgets/feed-card";

type ListingStripProps = {
  title: string;
  listings: Listing[];
};

/** Подборка главной: карточки в слайдере. */
const ListingStrip = ({ title, listings }: ListingStripProps) => (
  <Carousel title={title}>
    {listings.map((listing) => (
      <FeedCard key={listing.id} listing={listing} />
    ))}
  </Carousel>
);

export default ListingStrip;
