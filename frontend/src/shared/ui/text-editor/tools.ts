import type { Editor } from "@tiptap/react";
import { BoldIcon, ItalicIcon, QuoteIcon, UnderlineIcon } from "@/shared/ui/icons";

export const TOOLS = [
  {
    name: "bold",
    label: "Жирный",
    Icon: BoldIcon,
    run: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    name: "italic",
    label: "Курсив",
    Icon: ItalicIcon,
    run: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    name: "underline",
    label: "Подчёркнутый",
    Icon: UnderlineIcon,
    run: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    name: "blockquote",
    label: "Цитата",
    Icon: QuoteIcon,
    run: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

/** Сделать выделенный текст ссылкой. Ничего не выделено — вставить сам адрес ссылкой. */
export const addLink = (editor: Editor, href: string) => {
  if (editor.state.selection.empty) {
    editor
      .chain()
      .focus()
      .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
      .run();
    return;
  }

  editor.chain().focus().setLink({ href }).run();
};

/** Вставить смайлик в место курсора. */
export const addEmoji = (editor: Editor, emoji: string) =>
  editor.chain().focus().insertContent(emoji).run();
