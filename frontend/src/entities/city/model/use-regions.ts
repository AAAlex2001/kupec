"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/shared/lib/report-error";
import { fetchRegions } from "../api/cities";

/** Регионы для фильтра населённых пунктов. Пока не загрузились — пустой список. */
export const useRegions = () => {
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    fetchRegions()
      .then((found) => active && setRegions(found))
      .catch(reportError);

    return () => {
      active = false;
    };
  }, []);

  return regions;
};
