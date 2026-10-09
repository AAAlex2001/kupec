import Button from "@/shared/ui/button";
import styles from "./style.module.scss";

type AuthSwitchProps = {
  question: string;
  action: string;
  onClick: () => void;
};

/** Строка внизу окна: «Нет аккаунта? Зарегистрироваться». */
const AuthSwitch = ({ question, action, onClick }: AuthSwitchProps) => (
  <div className={styles.switch}>
    <span className={styles.question}>{question}</span>
    <Button variant="ghost" onClick={onClick}>
      {action}
    </Button>
  </div>
);

export default AuthSwitch;
