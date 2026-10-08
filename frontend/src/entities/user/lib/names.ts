import type { User } from "../model/types";

/** Как подписать пользователя: имя, а пока его нет — почта. */
export const displayName = (user: User) => user.name ?? user.email;

/** Буква для аватара без фото. */
export const avatarLetter = (user: User) => displayName(user).charAt(0).toUpperCase();
