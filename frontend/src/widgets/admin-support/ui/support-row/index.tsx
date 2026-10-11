import Link from "next/link";
import { supportPersonName, type AdminSupportThread } from "@/entities/support";
import { adminSupportPath } from "@/shared/config/routes";
import { formatMoment } from "@/shared/lib/format";
import Badge from "@/shared/ui/badge";
import styles from "./style.module.scss";

type SupportRowProps = {
  thread: AdminSupportThread;
};

/** Обращение в списке: кто пишет, начало последнего сообщения, когда и ждёт ли ответа. */
const SupportRow = ({ thread }: SupportRowProps) => (
  <Link className={styles.row} href={adminSupportPath(thread.id)}>
    <div className={styles.person}>
      <p className={styles.name}>
        {supportPersonName(thread)}
        {!thread.user && <span className={styles.guest}>гость</span>}
      </p>
      <p className={styles.preview}>{thread.preview}</p>
    </div>

    <div className={styles.meta}>
      <time className={styles.time} dateTime={thread.last_message_at}>
        {formatMoment(thread.last_message_at)}
      </time>
      {thread.unread_admin_count > 0 && (
        <span aria-label={`Непрочитанных сообщений: ${thread.unread_admin_count}`}>
          <Badge count={thread.unread_admin_count} />
        </span>
      )}
    </div>
  </Link>
);

export default SupportRow;
