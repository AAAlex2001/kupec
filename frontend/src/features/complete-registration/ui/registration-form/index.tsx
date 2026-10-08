"use client";

import { useId } from "react";
import { CitySelect } from "@/entities/city";
import type { User } from "@/entities/user";
import Button from "@/shared/ui/button";
import Field from "@/shared/ui/field";
import Input from "@/shared/ui/input";
import Title from "@/shared/ui/title";
import { useRegistration } from "../../model/use-registration";
import styles from "./style.module.scss";

type RegistrationFormProps = {
  user: User;
  onDone: () => void;
};

/** Шаг «Как вас зовут?» для нового аккаунта: имя и город. */
const RegistrationForm = ({ user, onDone }: RegistrationFormProps) => {
  const id = useId();
  const { name, city, pending, error, changeName, changeCity, save } = useRegistration(onDone);

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className={styles.head}>
        <Title>Как вас зовут?</Title>
        <p className={styles.text}>
          Почта {user.email} подтверждена. Осталось заполнить профиль.
        </p>
      </div>

      <Field label="Имя *" htmlFor={`${id}-name`} error={error}>
        <Input
          id={`${id}-name`}
          value={name}
          onChange={changeName}
          placeholder="Анна"
          invalid={Boolean(error)}
          autoFocus
          maxLength={100}
          autoComplete="given-name"
        />
      </Field>

      <Field label="Город · необязательно" htmlFor={`${id}-city`}>
        <CitySelect id={`${id}-city`} value={city} onChange={changeCity} />
      </Field>

      <Button className={styles.submit} type="submit" loading={pending}>
        Продолжить
      </Button>

      <p className={styles.hint}>
        Имя будет видно в объявлениях и переписке. Город можно выбрать позже.
      </p>
    </form>
  );
};

export default RegistrationForm;
