import { ListingCard, listingCard, type Listing } from "@/entities/listing";
import { WriteButton } from "@/features/start-chat";
import { FavoriteButton } from "@/features/toggle-favorite";

type FeedCardProps = {
  listing: Listing;
};

/** Карточка в выдаче: с сердечком и кнопкой «Написать». */
const FeedCard = ({ listing }: FeedCardProps) => (
  <ListingCard
    {...listingCard(listing)}
    favorite={<FavoriteButton listingId={listing.id} />}
    action={<WriteButton listingId={listing.id} ownerId={listing.owner.id} />}
  />
);

export default FeedCard;
