"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser, type User } from "@/entities/user";
import { RegistrationForm } from "@/features/complete-registration";
import { LoginForm } from "@/features/login";
import { RegisterForm } from "@/features/register";
import { ResetPasswordForm } from "@/features/reset-password";
import Modal from "@/shared/ui/modal";
import { SWITCHES, type AuthMode } from "./data";
import AuthSwitch from "./ui/auth-switch";

/** Окно входа и регистрации. Новому пользователю после входа — имя и город. */
const AuthModal = () => {
  const router = useRouter();
  const { user, setUser, authOpen, closeAuth } = useUser();
  const [mode, setMode] = useState<AuthMode>("login");
  const [completing, setCompleting] = useState(false);
  const switcher = SWITCHES[mode];

  const close = () => {
    setMode("login");
    setCompleting(false);
    closeAuth();
  };

  const finish = () => {
    close();
    router.refresh();
  };

  const signedIn = (signedUser: User) => {
    setUser(signedUser);

    if (signedUser.name) finish();
    else setCompleting(true);
  };

  if (completing && user) {
    return (
      <Modal open={authOpen} onClose={close} ariaLabel="Заполнение профиля">
        <RegistrationForm user={user} onDone={finish} />
      </Modal>
    );
  }

  return (
    <Modal open={authOpen} onClose={close} ariaLabel="Вход и регистрация">
      {authOpen && mode === "login" && (
        <LoginForm onSuccess={signedIn} onForgot={() => setMode("reset")} />
      )}
      {authOpen && mode === "register" && <RegisterForm onSuccess={signedIn} />}
      {authOpen && mode === "reset" && <ResetPasswordForm onSuccess={signedIn} />}

      <AuthSwitch
        question={switcher.question}
        action={switcher.action}
        onClick={() => setMode(switcher.to)}
      />
    </Modal>
  );
};

export default AuthModal;
