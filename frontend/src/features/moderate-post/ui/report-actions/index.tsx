"use client";

import { dismissReport, hidePost, removeComment, removePost, type Report } from "@/entities/post";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { usePostModeration } from "../../model/use-post-moderation";
import styles from "./style.module.scss";

type ReportActionsProps = {
  report: Report;
  onDone: () => void;
};

/** Решение по жалобе: скрыть или удалить пост, удалить комментарий или отклонить жалобу. */
const ReportActions = ({ report, onDone }: ReportActionsProps) => {
  const moderation = usePostModeration(onDone);
  const { post, comment } = report;
  const removeLabel = comment ? "Удалить комментарий" : "Удалить пост";

  const removeTarget = () => {
    if (comment) return removeComment(comment.id);
    if (post) return removePost(post.id);

    return Promise.resolve();
  };

  return (
    <div className={styles.actions}>
      {moderation.error && <p className={styles.error}>{moderation.error}</p>}

      {post && (
        <Button
          variant="secondary"
          loading={moderation.pending}
          onClick={() => moderation.run(() => hidePost(post.id))}
        >
          Скрыть пост
        </Button>
      )}
      <Button variant="danger" onClick={() => moderation.setConfirming(true)}>
        {removeLabel}
      </Button>
      <Button variant="ghost" onClick={() => moderation.run(() => dismissReport(report.id))}>
        Отклонить
      </Button>

      <ConfirmModal
        open={moderation.confirming}
        title="Удалить навсегда?"
        text="Вместе с ответами, фото и жалобами. Вернуть будет нельзя."
        confirmLabel="Удалить"
        pending={moderation.pending}
        onConfirm={() => moderation.run(removeTarget)}
        onClose={() => moderation.setConfirming(false)}
      />
    </div>
  );
};

export default ReportActions;
