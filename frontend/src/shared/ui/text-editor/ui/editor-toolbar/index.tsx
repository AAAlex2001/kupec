"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import Button from "@/shared/ui/button";
import { addEmoji, TOOLS } from "../../tools";
import type { EditorPanel } from "../../types";
import EmojiButton from "../emoji-button";
import LinkButton from "../link-button";
import styles from "./style.module.scss";

type EditorToolbarProps = {
  editor: Editor;
  panel?: EditorPanel;
  panelOpen: boolean;
  onPanelToggle: () => void;
};

/** Панель редактора: дополнительная панель, заголовки, оформление, цитата, ссылка и смайлики. Включённое подсвечено. */
const EditorToolbar = ({ editor, panel, panelOpen, onPanelToggle }: EditorToolbarProps) => {
  const active = useEditorState({
    editor,
    selector: ({ editor: current }): Record<string, boolean> => ({
      heading2: current.isActive("heading", { level: 2 }),
      heading3: current.isActive("heading", { level: 3 }),
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      blockquote: current.isActive("blockquote"),
      link: current.isActive("link"),
    }),
  });

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Оформление текста">
      {panel && (
        <Button
          variant="tool"
          size="icon"
          ariaLabel={panel.label}
          ariaPressed={panelOpen}
          onClick={onPanelToggle}
        >
          <panel.Icon />
        </Button>
      )}

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
      <EmojiButton onSelect={(emoji) => addEmoji(editor, emoji)} />
    </div>
  );
};

export default EditorToolbar;
