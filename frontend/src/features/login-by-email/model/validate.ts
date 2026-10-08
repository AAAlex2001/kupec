export const CODE_LENGTH = 6;

export const EMAIL_ERROR = "Введите корректный адрес, например anna@example.com";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Похоже ли на адрес почты: есть @ и домен с точкой. */
export const isEmail = (email: string) => EMAIL_PATTERN.test(email);
