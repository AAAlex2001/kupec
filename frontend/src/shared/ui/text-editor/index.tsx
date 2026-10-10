"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";
import { editorExtensions } from "./extensions";
import type { EditorPanel } from "./types";
import EditorCounter from "./ui/editor-counter";
import EditorToolbar from "./ui/editor-toolbar";
import styles from "./style.module.scss";

export type { EditorPanel } from "./types";

type TextEditorProps = {
  ariaLabel: string;
  placeholder: string;
  value: string;
  limit: number;
  panel?: EditorPanel;
  onChange: (html: string) => void;
};

/** Текст с оформлением: панель, поле и счётчик символов. value — начальный HTML. Наружу отдаёт HTML, пустой текст — "".
 *
 * panel — дополнительная панель: её кнопка первой в панели инструментов, сама она открывается над ней.
 */
const TextEditor = ({ ariaLabel, placeholder, value, limit, panel, onChange }: TextEditorProps) => {
  const [panelOpen, setPanelOpen] = useState(false);
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
      {panel && panelOpen && panel.render(editor)}

      <EditorToolbar
        editor={editor}
        panel={panel}
        panelOpen={panelOpen}
        onPanelToggle={() => setPanelOpen(!panelOpen)}
      />

      <div className={styles.body}>
        <EditorContent editor={editor} />
        <EditorCounter editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
