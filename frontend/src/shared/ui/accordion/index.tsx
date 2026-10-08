import AccordionItem from "./accordion-item";

type AccordionProps = {
  items: { title: string; text: string }[];
};

/** Список вопросов с ответами, которые плавно раскрываются по клику. */
const Accordion = ({ items }: AccordionProps) => (
  <div>
    {items.map((item) => (
      <AccordionItem key={item.title} title={item.title} text={item.text} />
    ))}
  </div>
);

export default Accordion;
