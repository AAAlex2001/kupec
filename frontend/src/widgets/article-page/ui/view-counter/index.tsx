"use client";

import { useEffect } from "react";
import { countArticleView } from "@/entities/article";
import { reportError } from "@/shared/lib/report-error";

type ViewCounterProps = {
  articleId: number;
};

/** Сообщает бэкенду о просмотре, когда статья открылась в браузере. Ничего не рисует. */
const ViewCounter = ({ articleId }: ViewCounterProps) => {
  useEffect(() => {
    countArticleView(articleId).catch(reportError);
  }, [articleId]);

  return null;
};

export default ViewCounter;
