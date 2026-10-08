"use client";

import { useEffect } from "react";
import { countListingView } from "@/entities/listing";

type ViewCounterProps = {
  listingId: number;
};

/** Сообщает бэкенду о просмотре, когда объявление открылось в браузере. Ничего не рисует. */
const ViewCounter = ({ listingId }: ViewCounterProps) => {
  useEffect(() => {
    countListingView(listingId).catch(() => undefined);
  }, [listingId]);

  return null;
};

export default ViewCounter;
