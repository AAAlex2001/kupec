"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/entities/user";
import { ACCOUNT_PATH, FAVORITES_PATH, MESSAGES_PATH } from "@/shared/config/routes";
import { UserRoundIcon } from "@/shared/ui/icons";
import ActionLink from "../action-link";

/** Пункт шапки «Вход и регистрация» открывает окно входа, после входа — имя со ссылкой в кабинет. */
const AccountLink = () => {
  const { user, openAuth } = useUser();
  const pathname = usePathname();

  if (!user) {
    return <ActionLink label="Вход и регистрация" icon={<UserRoundIcon />} onClick={openAuth} />;
  }

  const active =
    pathname.startsWith(ACCOUNT_PATH) &&
    !pathname.startsWith(FAVORITES_PATH) &&
    !pathname.startsWith(MESSAGES_PATH);

  return (
    <ActionLink
      href={ACCOUNT_PATH}
      label={user.name ?? "Профиль"}
      icon={<UserRoundIcon />}
      active={active}
    />
  );
};

export default AccountLink;
