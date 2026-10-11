import cn from "classnames";
import type { ReactNode } from "react";
import Logo from "@/shared/ui/logo";
import SupportComposer from "../support-composer";
import styles from "./style.module.scss";

type SupportFrameProps = {
  title: string;
  subtitle: ReactNode;
  action?: ReactNode;
  placeholder: string;
  onSend: (text: string, files: File[]) => Promise<void>;
  children: ReactNode;
};

/** Каркас чата поддержки: серая шапка с логотипом, лента с прокруткой и серая панель ввода. Один на сайте и в админке. */
const SupportFrame = ({ title, subtitle, action, placeholder, onSend, children }: SupportFrameProps) => (
  <div className={styles.frame}>
    <header className={styles.header}>
      <div className={cn(styles.panel, styles.bar)}>
        <div className={styles.brand}>
          <Logo size="sm" ariaLabel="Купец" />
          <div className={styles.headline}>
            <p className={styles.title}>{title}</p>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </div>
        {action}
      </div>
    </header>

    <div className={styles.body}>
      <div className={styles.column}>{children}</div>
    </div>

    <footer className={styles.footer}>
      <div className={styles.panel}>
        <SupportComposer placeholder={placeholder} onSend={onSend} />
      </div>
    </footer>
  </div>
);

export default SupportFrame;
