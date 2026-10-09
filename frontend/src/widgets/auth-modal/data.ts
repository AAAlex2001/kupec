export type AuthMode = "login" | "register" | "reset";

export const SWITCHES: Record<AuthMode, { question: string; action: string; to: AuthMode }> = {
  login: { question: "Нет аккаунта?", action: "Зарегистрироваться", to: "register" },
  register: { question: "Уже зарегистрированы?", action: "Войти", to: "login" },
  reset: { question: "Вспомнили пароль?", action: "Войти", to: "login" },
};
