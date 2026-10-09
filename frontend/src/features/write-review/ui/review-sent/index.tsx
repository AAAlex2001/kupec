import type { Review } from "@/entities/review";
import { MY_REVIEWS_PATH } from "@/shared/config/routes";
import Button from "@/shared/ui/button";
import EmptyState from "@/shared/ui/empty-state";
import { CircleAlertIcon, CircleCheckIcon } from "@/shared/ui/icons";
import Notice from "@/shared/ui/notice";
import styles from "./style.module.scss";

type ReviewSentProps = {
  review: Review;
  onDone: () => void;
};

/** Итог отправки: отзыв ушёл на проверку или сразу отклонён автопроверкой с причиной. */
const ReviewSent = ({ review, onDone }: ReviewSentProps) => {
  const action = (
    <Button href={MY_REVIEWS_PATH} onClick={onDone}>
      Мои отзывы
    </Button>
  );

  if (review.status === "rejected") {
    return (
      <EmptyState
        icon={<CircleAlertIcon />}
        title="Отзыв не прошёл проверку"
        text={`${review.reject_reason ?? ""} Исправить его можно во вкладке «Отклонённые».`}
        action={action}
      />
    );
  }

  return (
    <div className={styles.sent}>
      <EmptyState
        icon={<CircleCheckIcon />}
        title="Отзыв отправлен на проверку"
        text="Посмотреть статус можно во вкладке «На проверке». После модерации отзыв появится у автора."
        action={action}
      />
      <Notice tone="info">Вы можете изменить текст, пока отзыв находится на проверке.</Notice>
    </div>
  );
};

export default ReviewSent;
