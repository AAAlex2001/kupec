import { listingPath, userPath } from "@/shared/config/routes";
import { absoluteUrl, shorten } from "@/shared/lib/seo";
import type { Listing } from "../model/types";

/** Главное фото объявления для превью ссылки. Нет фото — null. */
export const listingCover = (listing: Listing) => listing.photos[0]?.url ?? null;

/** Описание страницы объявления: начало текста, а если его нет — название и город. */
export const listingDescription = (listing: Listing) => {
  const text = listing.description?.replace(/\s+/g, " ").trim();
  if (text) return shorten(text);

  const place = listing.city ? `, ${listing.city.name}` : "";

  return `${listing.title}${place}. Объявление на «Купце».`;
};

/** Цена для schema.org. Без цены — без предложения. */
export const listingOffer =(listing: Listing) => {
  if (!listing.price) return undefined;

  return {
    "@type": "Offer",
    price: listing.price,
    priceCurrency: "RUB",
    availability: "https://schema.org/InStock",
    url: absoluteUrl(listingPath(listing.id)),
    seller: {
      "@type": "Person",
      name: listing.owner.name ?? "Продавец",
      url: absoluteUrl(userPath(listing.owner.id)),
    },
  };
};

/** Разметка schema.org: товар или услуга с фото, ценой и продавцом. */
export const listingJsonLd = (listing: Listing) => {
  const type = listing.kind === "service" ? "Service" : "Product";

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: listing.title,
    description: listingDescription(listing),
    url: absoluteUrl(listingPath(listing.id)),
    image: listing.photos.map((photo) => absoluteUrl(photo.url)),
    category: listing.category?.name,
    offers: listingOffer(listing),
  };
};
