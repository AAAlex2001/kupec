"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import Button from "@/shared/ui/button";
import { addEmoji, TOOLS } from "../../tools";
import EmojiButton from "../emoji-button";
import LinkButton from "../link-button";
import styles from "./style.module.scss";

type EditorToolbarProps = {
  editor: Editor;
};

/** Панель редактора: оформление, цитата, ссылка и смайлики. Включённое оформление подсвечено. */
const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const active = useEditorState({
    editor,
    selector: ({ editor: current }): Record<string, boolean> => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      blockquote: current.isActive("blockquote"),
      link: current.isActive("link"),
    }),
  });

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Оформление текста">
      {TOOLS.map(({ name, label, Icon, run }) => (
        <Button
          key={name}
          variant="tool"
          size="icon"
          ariaLabel={label}
          ariaPressed={active[name]}
          onClick={() => run(editor)}
        >
          <Icon />
        </Button>
      ))}

      <LinkButton editor={editor} active={active.link} />

      <span className={styles.divider} aria-hidden="true" />

      <EmojiButton onSelect={(emoji) => addEmoji(editor, emoji)} />
    </div>
  );
};

export default EditorToolbar;
