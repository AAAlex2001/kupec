"use client";

import Link from "next/link";
import { SupportFrame, SupportMessages, supportPersonName } from "@/entities/support";
import { ADMIN_SUPPORT_PATH, adminUserPath } from "@/shared/config/routes";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import { useAdminSupportThread } from "./model/use-admin-support-thread";
import styles from "./style.module.scss";

type AdminSupportThreadProps = {
  threadId: number;
};

/** Обращение в поддержку в админке: тот же чат, что у посетителя на сайте, только отвечает поддержка. */
const AdminSupportThread = ({ threadId }: AdminSupportThreadProps) => {
  const { detail, error, reply } = useAdminSupportThread(threadId);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!detail) return <Loader />;

  const { thread, messages } = detail;
  const name = supportPersonName(thread);
  const subtitle = thread.user ? (
    <Link className={styles.link} href={adminUserPath(thread.user.id)}>
      {thread.user.email} · профиль в админке
    </Link>
  ) : (
    "Гость без аккаунта: ответ увидит в чате на сайте, в том же браузере"
  );

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[{ label: "Поддержка", href: ADMIN_SUPPORT_PATH }, { label: name }]} />

      <div className={styles.chat}>
        <SupportFrame title={name} subtitle={subtitle} placeholder="Ответить…" onSend={reply}>
          <SupportMessages messages={messages} side="admin" visitorName={name} />
        </SupportFrame>
      </div>
    </div>
  );
};

export default AdminSupportThread;
