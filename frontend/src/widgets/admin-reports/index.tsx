"use client";

import { useState } from "react";
import {
  fetchReports,
  ReportCard,
  type Report,
  type ReportPage,
  type ReportStatus,
} from "@/entities/post";
import { ReportActions } from "@/features/moderate-post";
import { usePaged } from "@/shared/lib/use-paged";
import Button from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Tabs from "@/shared/ui/tabs";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

const TABS: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Ждут решения" },
  { value: "resolved", label: "Рассмотренные" },
];

const PAGE_SIZE = 20;

/** Админка «Жалобы»: жалобы на посты и комментарии, решение по каждой. */
const AdminReports = () => {
  const [status, setStatus] = useState<ReportStatus>("open");
  const list = usePaged<Report, ReportPage>(status, (offset) =>
    fetchReports(status, PAGE_SIZE, offset),
  );

  return (
    <section className={styles.section}>
      <Title as="h1">Жалобы</Title>

      <Tabs
        ariaLabel="Состояние жалоб"
        value={status}
        tabs={TABS.map((tab) => ({ ...tab, count: list.page?.counts[tab.value] ?? 0 }))}
        onChange={(value) => setStatus(value as ReportStatus)}
      />

      {list.error && <Notice tone="error">{list.error}</Notice>}
      {!list.items && !list.error && <Loader />}
      {list.items?.length === 0 && <p className={styles.empty}>Жалоб нет.</p>}

      <div className={styles.list}>
        {list.items?.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            actions={
              report.status === "open" && <ReportActions report={report} onDone={list.reload} />
            }
          />
        ))}
      </div>

      {list.hasMore && (
        <Button variant="secondary" loading={list.loadingMore} onClick={list.loadMore}>
          Показать ещё
        </Button>
      )}
    </section>
  );
};

export default AdminReports;
