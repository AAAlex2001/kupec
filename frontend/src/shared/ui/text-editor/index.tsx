"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import EditorCounter from "./ui/editor-counter";
import EditorToolbar from "./ui/editor-toolbar";
import styles from "./style.module.scss";

type TextEditorProps = {
  ariaLabel: string;
  placeholder: string;
  value: string;
  limit: number;
  onChange: (html: string) => void;
};

/** Текст с оформлением: панель, поле и счётчик символов. value — начальный HTML. Наружу отдаёт HTML, пустой текст — "". */
const TextEditor = ({ ariaLabel, placeholder, value, limit, onChange }: TextEditorProps) => {
  const editor = useEditor({
    extensions: editorExtensions(placeholder, limit),
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { class: styles.field, "aria-label": ariaLabel } },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  if (!editor) return <div className={styles.field} />;

  return (
    <div className={styles.editor}>
      <EditorToolbar editor={editor} />

      <div className={styles.body}>
        <EditorContent editor={editor} />
        <EditorCounter editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
