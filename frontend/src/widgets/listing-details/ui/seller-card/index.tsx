import { ListingCard, listingCard, type Listing } from "@/entities/listing";
import { FavoriteButton } from "@/features/toggle-favorite";
import { listingPath } from "@/shared/config/routes";
import Button from "@/shared/ui/button";

type SellerCardProps = {
  listing: Listing;
};

/** Карточка в «Ещё от этого продавца»: с сердечком и кнопкой «Перейти». */
const SellerCard = ({ listing }: SellerCardProps) => (
  <ListingCard
    {...listingCard(listing)}
    favorite={<FavoriteButton listingId={listing.id} />}
    action={
      <Button variant="secondary" href={listingPath(listing.id)}>
        Перейти
      </Button>
    }
  />
);

export default SellerCard;
