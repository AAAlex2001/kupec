"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser, type User } from "@/entities/user";
import { RegistrationForm } from "@/features/complete-registration";
import { LoginForm } from "@/features/login-by-email";
import Modal from "@/shared/ui/modal";

/** Окно входа и регистрации: почта, код, а новому пользователю — имя и город. */
const AuthModal = () => {
  const router = useRouter();
  const { user, setUser, authOpen, closeAuth } = useUser();
  const [registering, setRegistering] = useState(false);

  const close = () => {
    setRegistering(false);
    closeAuth();
  };

  const finish = () => {
    close();
    router.refresh();
  };

  const loggedIn = (loggedUser: User) => {
    setUser(loggedUser);

    if (loggedUser.name) finish();
    else setRegistering(true);
  };

  return (
    <Modal open={authOpen} onClose={close} ariaLabel="Вход и регистрация">
      {authOpen && registering && user && <RegistrationForm user={user} onDone={finish} />}
      {authOpen && !registering && <LoginForm onSuccess={loggedIn} />}
    </Modal>
  );
};

export default AuthModal;
