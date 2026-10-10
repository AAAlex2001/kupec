import { textFromHtml } from "@/shared/lib/seo";
import type { DocTocItem } from "@/shared/ui/doc-toc";

/** Стабильные якоря заголовков для содержания опубликованного HTML. */
export const articleContents = (html: string) => {
  const items: DocTocItem[] = [];
  const text = html.replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, level, attributes, content) => {
    const id = `article-section-${items.length + 1}`;
    items.push({ id, title: textFromHtml(content) });
    const cleanAttributes = attributes.replace(/\s+id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    return `<h${level}${cleanAttributes} id="${id}">${content}</h${level}>`;
  });

  return { items, html: text };
};
