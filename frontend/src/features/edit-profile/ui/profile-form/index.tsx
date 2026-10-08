"use client";

import { useId, type ReactNode } from "react";
import { CitySelect } from "@/entities/city";
import type { User } from "@/entities/user";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Notice from "@/shared/ui/notice";
import { useProfileForm } from "../../model/use-profile-form";
import NotificationFields from "../notification-fields";
import styles from "./style.module.scss";

type ProfileFormProps = {
  user: User;
  emailField: ReactNode;
};

/** Форма профиля: имя, город, телефон и уведомления. Поле почты приходит слотом. */
const ProfileForm = ({ user, emailField }: ProfileFormProps) => {
  const id = useId();
  const { state, change, reset, save } = useProfileForm(user);
  const { fields } = state;
  const saving = state.status === "saving";

  return (
    <div className={styles.form}>
      <section className={styles.section}>
        <Field label="Имя" htmlFor={`${id}-name`}>
          <Input
            id={`${id}-name`}
            value={fields.name}
            onChange={(name) => change({ name })}
            placeholder="Как к вам обращаться"
            maxLength={100}
            autoComplete="name"
          />
        </Field>

        {emailField}

        <Field label="Город" htmlFor={`${id}-city`}>
          <CitySelect id={`${id}-city`} value={fields.city} onChange={(city) => change({ city })} />
        </Field>

        <Field
          label="Контактный телефон · необязательно"
          htmlFor={`${id}-phone`}
          hint="Номер можно добавить для связи по объявлениям. Для регистрации он не нужен."
        >
          <Input
            id={`${id}-phone`}
            type="tel"
            value={fields.phone}
            onChange={(phone) => change({ phone })}
            placeholder="Не указан"
            maxLength={32}
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
      </section>

      <NotificationFields fields={fields} onChange={change} />

      {state.status === "saved" && <Notice>Настройки сохранены</Notice>}
      {state.status === "error" && <Notice tone="error">{state.error}</Notice>}

      <div className={styles.actions}>
        <Button disabled={saving} onClick={save}>
          {saving ? "Сохраняем…" : "Сохранить изменения"}
        </Button>

        <Button variant="ghost" disabled={saving} onClick={reset}>
          Отменить
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
