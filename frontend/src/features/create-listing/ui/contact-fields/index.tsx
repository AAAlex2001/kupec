"use client";

import { useId } from "react";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import type { ListingFields } from "../../model/types";
import styles from "./style.module.scss";

type ContactFieldsProps = {
  phone: string;
  onChange: (changes: Partial<ListingFields>) => void;
};

/** Блок «Связь с вами»: переписка на сайте и телефон по желанию. */
const ContactFields = ({ phone, onChange }: ContactFieldsProps) => {
  const id = useId();

  return (
    <section className={styles.section}>
      <Title>Связь с вами</Title>

      <Notice tone="info">
        Покупатели смогут написать вам на сайте. Переписка останется в разделе «Сообщения».
      </Notice>

      <Field
        label="Контактный телефон · необязательно"
        htmlFor={`${id}-phone`}
        hint="Если добавите номер, посетители смогут посмотреть его в объявлении. Для входа используется только почта."
      >
        <Input
          id={`${id}-phone`}
          type="tel"
          value={phone}
          onChange={(contactPhone) => onChange({ contactPhone })}
          placeholder="Не указан"
          maxLength={32}
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>
    </section>
  );
};

export default ContactFields;
