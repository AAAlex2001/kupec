import Link from "next/link";
import { PERSONAL_DATA_PATH, RULES_PATH, TERMS_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import Notice from "@/shared/ui/notice";
import type { ListingFormState } from "../../model/types";
import styles from "./style.module.scss";

type FormActionsProps = {
  state: ListingFormState;
  editing: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
  onPreview: () => void;
};

/** Низ формы: согласие с правилами, ошибки и кнопки «Опубликовать», «Черновик», «Предпросмотр». */
const FormActions = ({ state, editing, onPublish, onSaveDraft, onPreview }: FormActionsProps) => {
  const hasErrors = Object.keys(state.errors).length > 0;
  const publishLabel = editing ? "Сохранить и опубликовать" : "Опубликовать";

  return (
    <section className={styles.section}>
      {hasErrors && <Notice tone="error">Проверьте поля, отмеченные красным.</Notice>}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.saving === "publish" && (
        <Notice tone="info">Публикуем объявление. Пожалуйста, не закрывайте страницу.</Notice>
      )}

      <p className={styles.terms}>
        Публикуя объявление, вы принимаете <Link href={RULES_PATH}>Правила площадки</Link> и{" "}
        <Link href={TERMS_PATH}>пользовательское соглашение</Link>.
        {" "}<Link href={PERSONAL_DATA_PATH}>Обработка персональных данных</Link>. Поля с * обязательны.
      </p>

      <div className={styles.buttons}>
        <Button
          loading={state.saving === "publish"}
          disabled={state.saving !== null}
          onClick={onPublish}
        >
          {state.saving === "publish" ? "Публикуем…" : publishLabel}
        </Button>

        <Button
          variant="secondary"
          loading={state.saving === "draft"}
          disabled={state.saving !== null}
          onClick={onSaveDraft}
        >
          {state.saving === "draft" ? "Сохраняем…" : "Сохранить черновик"}
        </Button>

        <Button variant="ghost" onClick={onPreview}>
          Предпросмотр
        </Button>
      </div>
    </section>
  );
};

export default FormActions;
