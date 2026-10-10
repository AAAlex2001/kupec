"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/shared/lib/report-error";
import { fetchMyPostCounts } from "../api/posts";
import type { PostCounts } from "./types";

/** Счётчики своих постов. version — поменять, чтобы перечитать после удаления. */
export const useMyPostCounts = (version: number) => {
  const [counts, setCounts] = useState<PostCounts | null>(null);

  useEffect(() => {
    let active = true;

    fetchMyPostCounts()
      .then((found) => active && setCounts(found))
      .catch(reportError);

    return () => {
      active = false;
    };
  }, [version]);

  return counts;
};
