import type { ReactNode } from "react";
import { formatDate, formatTime } from "@/shared/lib/format";
import type { Report } from "../../model/types";
import PostCard from "../post-card";
import styles from "./style.module.scss";

type ReportCardProps = {
  report: Report;
  actions?: ReactNode;
};

/** Жалоба для модератора: кто и почему пожаловался, а ниже — сам пост или комментарий. */
const ReportCard = ({ report, actions }: ReportCardProps) => (
  <article className={styles.report}>
    <p className={styles.meta}>
      {report.reporter.name ?? "Пользователь"} · {formatDate(report.created_at)} ·{" "}
      {formatTime(report.created_at)}
    </p>
    <p className={styles.reason}>{report.reason}</p>

    {report.post && <PostCard post={report.post} />}

    {report.comment && (
      <div className={styles.comment}>
        <p className={styles.meta}>Комментарий · {report.comment.author.name ?? "Пользователь"}</p>
        <p className={styles.text}>{report.comment.text}</p>
      </div>
    )}

    {actions}
  </article>
);

export default ReportCard;
