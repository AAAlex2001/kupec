export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Купец";

export const SITE_TITLE = `${SITE_NAME} — частные объявления по всей России`;

export const SITE_DESCRIPTION =
  "Частные объявления по всей России: товары и услуги — от домашних солений до ремонта авто.";
