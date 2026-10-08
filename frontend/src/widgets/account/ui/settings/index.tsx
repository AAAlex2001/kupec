"use client";

import { useUser } from "@/entities/user";
import { AvatarPicker } from "@/features/change-avatar";
import { EmailField } from "@/features/change-email";
import { ProfileForm } from "@/features/edit-profile";
import styles from "./style.module.scss";

/** Раздел «Настройки»: фото, форма профиля и смена почты внутри неё. */
const AccountSettings = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className={styles.settings}>
      <AvatarPicker user={user} />
      <ProfileForm user={user} emailField={<EmailField user={user} />} />
    </div>
  );
};

export default AccountSettings;
