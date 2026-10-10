import Accordion from "@/shared/ui/accordion";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type FaqProps = {
  questions: { question: string; answer: string }[];
};

/** «Частые вопросы»: заголовок и аккордеон с ответами. */
const Faq = ({ questions }: FaqProps) => (
  <section id="faq" className={styles.faq}>
    <Title>Частые вопросы</Title>
    <Accordion
      items={questions.map(({ question, answer }) => ({
        title: question,
        text: answer,
      }))}
    />
  </section>
);

export default Faq;
