import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { EMPTY_STATES, type EmptySection } from "../../data";

type AccountEmptyProps = {
  section: EmptySection;
};

/** Пустой раздел кабинета с кнопкой следующего шага. */
const AccountEmpty = ({ section }: AccountEmptyProps) => {
  const { Icon, title, text, action } = EMPTY_STATES[section];

  return (
    <EmptyState
      icon={<Icon />}
      title={title}
      text={text}
      action={<Button href={action.href}>{action.label}</Button>}
    />
  );
};

export default AccountEmpty;
