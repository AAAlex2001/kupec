"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import Button from "@/shared/ui/button";
import { AiEditIcon, SendIcon } from "@/shared/ui/icons";
import type { EditorPanel } from "@/shared/ui/text-editor";
import { AI_ACTIONS } from "../../lib/ai-actions";
import { useAiPanel } from "../../model/use-ai-panel";
import styles from "./style.module.scss";

type AiPanelProps = {
  editor: Editor;
};

/** Панель ИИ: своя просьба в строке и быстрые действия с текстом. Ответ заменяет текст редактора. */
const AiPanel = ({ editor }: AiPanelProps) => {
  const panel = useAiPanel(editor);
  const empty = useEditorState({ editor, selector: ({ editor: current }) => current.isEmpty });
  const placeholder = empty
    ? "Опишите, о чём написать пост…"
    : "Напишите, что нужно сделать с текстом…";

  return (
    <div className={styles.panel}>
      <div className={styles.bar}>
        <input
          className={styles.input}
          value={panel.instruction}
          placeholder={placeholder}
          aria-label="Просьба к ИИ"
          maxLength={1000}
          disabled={panel.pending}
          onChange={(event) => panel.setInstruction(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            panel.run(panel.instruction);
          }}
        />
        <Button
          variant="tool"
          size="icon"
          ariaLabel="Отправить"
          loading={panel.pending}
          disabled={!panel.instruction.trim()}
          onClick={() => panel.run(panel.instruction)}
        >
          <SendIcon />
        </Button>
      </div>

      <div className={styles.quick}>
        <p className={styles.label}>Быстрые действия</p>

        <div className={styles.actions}>
          {AI_ACTIONS.map(({ label, instruction }) => (
            <Button
              key={label}
              variant="chip"
              disabled={empty || panel.pending}
              onClick={() => panel.run(instruction)}
            >
              <span className={styles.dot} aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {panel.pending && <p className={styles.status}>ИИ пишет текст, обычно это занимает до минуты…</p>}
      {panel.error && <p className={styles.error}>{panel.error}</p>}

      {panel.applied && !panel.pending && (
        <div className={styles.applied}>
          <p className={styles.status}>Текст заменён ответом ИИ.</p>
          <Button variant="ghost" onClick={panel.undo}>
            Вернуть как было
          </Button>
        </div>
      )}
    </div>
  );
};

/** ИИ-помощник как дополнительная панель редактора поста. */
export const AI_PANEL: EditorPanel = {
  label: "Написать с ИИ",
  Icon: AiEditIcon,
  render: (editor) => <AiPanel editor={editor} />,
};

export default AiPanel;
