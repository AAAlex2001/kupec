import DocToc from "@/shared/ui/doc-toc";
import type { InfoSection } from "../../model/types";

type InfoContentsProps = {
  sections: InfoSection[];
};

/** Содержание справки с дополнительной ссылкой на частые вопросы. */
const InfoContents = ({ sections }: InfoContentsProps) => (
  <DocToc
    title="Разделы"
    items={[...sections, { id: "faq", title: "Частые вопросы" }]}
  />
);

export default InfoContents;
