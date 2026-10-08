import Accordion from "@/shared/ui/accordion";
import Title from "@/shared/ui/title";
import type { InfoQuestion } from "../../model/types";
import styles from "./style.module.scss";

type InfoFaqProps = {
  questions: InfoQuestion[];
};

/** «Частые вопросы»: заголовок и аккордеон с ответами. */
const InfoFaq = ({ questions }: InfoFaqProps) => (
  <section id="faq" className={styles.faq}>
    <Title>Частые вопросы</Title>
    <Accordion items={questions.map(({ question, answer }) => ({ title: question, text: answer }))} />
  </section>
);

export default InfoFaq;
