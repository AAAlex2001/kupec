"use client";

import { reportComment, type Comment } from "@/entities/comment";
import { ReportModal, useReport } from "@/features/report-content";
import ActionMenu from "@/shared/ui/action-menu";
import { FlagIcon } from "@/shared/ui/icons";

type CommentReportMenuProps = {
  comment: Comment;
};

/** Меню «⋯» чужого комментария: «Пожаловаться». Гостю — после входа. */
const CommentReportMenu = ({ comment }: CommentReportMenuProps) => {
  const report = useReport((reason) => reportComment(comment.id, reason));

  return (
    <>
      <ActionMenu
        ariaLabel="Действия с комментарием"
        actions={[{ label: "Пожаловаться", Icon: FlagIcon, danger: true, onClick: report.start }]}
      />
      <ReportModal report={report} />
    </>
  );
};

export default CommentReportMenu;
