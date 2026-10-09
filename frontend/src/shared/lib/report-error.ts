/** Сообщить об ошибке фонового запроса, которую пользователю показывать незачем. Сюда же потом подключается Sentry. */
export const reportError = (failure: unknown) => {
  console.error(failure);
};
