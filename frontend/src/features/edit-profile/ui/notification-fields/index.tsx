import Checkbox from "@/shared/ui/checkbox";
import Title from "@/shared/ui/title";
import type { ProfileFields } from "../../model/types";
import styles from "./style.module.scss";

type NotificationFieldsProps = {
  fields: ProfileFields;
  onChange: (changes: Partial<ProfileFields>) => void;
};

/** Блок «Уведомления»: куда присылать сообщения и новости площадки. */
const NotificationFields = ({ fields, onChange }: NotificationFieldsProps) => (
  <section className={styles.section}>
    <Title>Уведомления</Title>

    <Checkbox
      checked={fields.notifyMessagesEmail}
      onChange={(notifyMessagesEmail) => onChange({ notifyMessagesEmail })}
    >
      Новые сообщения на почту
    </Checkbox>

    <Checkbox checked={fields.notifySite} onChange={(notifySite) => onChange({ notifySite })}>
      Уведомления на сайте
    </Checkbox>

    <Checkbox
      checked={fields.notifyNewsEmail}
      onChange={(notifyNewsEmail) => onChange({ notifyNewsEmail })}
    >
      Новости площадки на почту
    </Checkbox>
  </section>
);

export default NotificationFields;
