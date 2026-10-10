import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type PostPageHeadProps = {
  title: string;
  hint: string;
};

/** Шапка страницы поста: заголовок и подпись. */
const PostPageHead = ({ title, hint }: PostPageHeadProps) => (
  <div className={styles.head}>
    <Title as="h1">{title}</Title>
    <p className={styles.hint}>{hint}</p>
  </div>
);

export default PostPageHead;
