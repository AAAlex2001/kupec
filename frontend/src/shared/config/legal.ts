/** Реальные реквизиты заполняет владелец площадки; фиктивные данные не подставляем. */
export const LEGAL_OPERATOR = {
  name: process.env.LEGAL_OPERATOR_NAME ?? "Толстов Александр Сергеевич",
  registration: process.env.LEGAL_OPERATOR_REGISTRATION ?? "Физическое лицо, ИНН 380118752702",
  email: process.env.LEGAL_OPERATOR_EMAIL ?? "kupecmarket@mail.ru",
  hosting: process.env.LEGAL_HOSTING_DESCRIPTION ?? "Сервер сайта размещён у Cloud4box в Российской Федерации, в Москве. Место размещения сервера подтверждено владельцем площадки. Размещение резервных копий описано отдельно ниже.",
  mail: process.env.LEGAL_MAIL_DESCRIPTION ?? "Письма отправляются с почтового сервера владельца; внешний сервис рассылок не используется. При доставке почтовые операторы отправителя и получателя обрабатывают адрес и содержимое письма.",
  backups: process.env.LEGAL_BACKUP_DESCRIPTION ?? "Резервные копии создаются один раз в месяц и хранятся в Российской Федерации на инфраструктуре Cloud4box. Срок хранения каждой копии — 30 календарных дней с даты её создания; по истечении срока копия подлежит удалению. Доступ к копиям ограничивается задачами восстановления и защиты данных.",
};

export const LEGAL_DETAILS_COMPLETE = Boolean(
  LEGAL_OPERATOR.name && LEGAL_OPERATOR.email &&
  LEGAL_OPERATOR.hosting && LEGAL_OPERATOR.mail && LEGAL_OPERATOR.backups,
) && process.env.LEGAL_DOCUMENTS_FINALIZED === "true";

export const LEGAL_REVISION = "2026-10-10";
