"use client";

import { useUser } from "@/entities/user";
import { AvatarPicker } from "@/features/change-avatar";
import { EmailField } from "@/features/change-email";
import { TelegramSettings } from "@/features/connect-telegram";
import { ProfileForm } from "@/features/edit-profile";
import ThemeSelect from "@/shared/ui/theme-select";
import styles from "./style.module.scss";

/** Раздел «Настройки»: фото, тема, форма профиля со сменой почты и Telegram-канал. */
const AccountSettings = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className={styles.settings}>
      <AvatarPicker user={user} />
      <ThemeSelect />
      <ProfileForm user={user} emailField={<EmailField user={user} />} />
      <TelegramSettings />
    </div>
  );
};

export default AccountSettings;
