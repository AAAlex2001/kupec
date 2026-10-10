"use client";

import { useEffect, useState } from "react";
import { fetchFollowingUnseen, markFollowingSeen } from "@/entities/post";
import { reportError } from "@/shared/lib/report-error";

/** Сколько новых постов в подписках. Только для вошедшего. seen — вкладку открыли: счётчик обнуляется. */
export const useFollowingUnseen = (signedIn: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!signedIn) return;

    let active = true;

    fetchFollowingUnseen()
      .then((found) => active && setCount(found.count))
      .catch(reportError);

    return () => {
      active = false;
    };
  }, [signedIn]);

  const seen = () => {
    setCount(0);
    markFollowingSeen().catch(reportError);
  };

  return { count, seen };
};
