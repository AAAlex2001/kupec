"use client";

import Button from "@/shared/ui/button";
import Modal from "@/shared/ui/modal";
import TextModal from "@/shared/ui/text-modal";
import Title from "@/shared/ui/title";
import type { ReportState } from "../../model/use-report";
import styles from "./style.module.scss";

type ReportModalProps = {
  report: ReportState;
};

/** Окно жалобы: причина и «Отправить», после отправки — «Спасибо». */
const ReportModal = ({ report }: ReportModalProps) => {
  if (report.sent) {
    return (
      <Modal open={report.open} onClose={report.close} ariaLabel="Жалоба отправлена">
        <div className={styles.sent}>
          <Title>Спасибо!</Title>
          <p className={styles.text}>Жалоба отправлена модератору. Он проверит её и примет меры.</p>
          <Button onClick={report.close}>Закрыть</Button>
        </div>
      </Modal>
    );
  }

  return (
    <TextModal
      open={report.open}
      title="Пожаловаться"
      label="Что не так? Например: спам, оскорбления, обман"
      submitLabel="Отправить"
      pending={report.pending}
      error={report.error}
      danger
      onSubmit={report.submit}
      onClose={report.close}
    />
  );
};

export default ReportModal;
