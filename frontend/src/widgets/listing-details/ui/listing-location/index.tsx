"use client";

import { cityAddress, type City } from "@/entities/city";
import type { Listing } from "@/entities/listing";
import YandexMap from "@/shared/ui/yandex-map";
import { useListingPoint } from "../../model/use-listing-point";
import Section from "../section";
import styles from "./style.module.scss";

type ListingLocationProps = {
  listing: Listing;
  city: City;
};

/** «Местоположение»: адрес и Яндекс Карта с меткой. */
const ListingLocation = ({ listing, city }: ListingLocationProps) => {
  const point = useListingPoint(listing);

  return (
    <Section title="Местоположение">
      <p className={styles.address}>{cityAddress(city, listing.address ?? "")}</p>
      <YandexMap point={point} />
    </Section>
  );
};

export default ListingLocation;
