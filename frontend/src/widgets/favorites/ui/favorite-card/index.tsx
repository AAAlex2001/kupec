import { ListingCard, listingCard, type Listing } from "@/entities/listing";
import { WriteButton } from "@/features/start-chat";
import { FavoriteButton } from "@/features/toggle-favorite";

type FavoriteCardProps = {
  listing: Listing;
};

/** Карточка в избранном: с сердечком и кнопкой «Связаться». */
const FavoriteCard = ({ listing }: FavoriteCardProps) => (
  <ListingCard
    {...listingCard(listing)}
    favorite={<FavoriteButton listingId={listing.id} />}
    action={<WriteButton listingId={listing.id} ownerId={listing.owner.id} label="Связаться" />}
  />
);

export default FavoriteCard;
