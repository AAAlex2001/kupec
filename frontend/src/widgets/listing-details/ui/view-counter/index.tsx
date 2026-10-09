"use client";

import { useEffect } from "react";
import { countListingView } from "@/entities/listing";
import { reportError } from "@/shared/lib/report-error";

type ViewCounterProps = {
  listingId: number;
};

/** Сообщает бэкенду о просмотре, когда объявление открылось в браузере. Ничего не рисует. */
const ViewCounter = ({ listingId }: ViewCounterProps) => {
  useEffect(() => {
    countListingView(listingId).catch(reportError);
  }, [listingId]);

  return null;
};

export default ViewCounter;
