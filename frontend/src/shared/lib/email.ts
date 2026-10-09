export const EMAIL_ERROR = "Введите корректный адрес, например anna@example.com";

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_ERROR = `Пароль — не меньше ${PASSWORD_MIN_LENGTH} символов`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Похоже ли на адрес почты: есть @ и домен с точкой. */
export const isEmail = (email: string) => EMAIL_PATTERN.test(email.trim());
