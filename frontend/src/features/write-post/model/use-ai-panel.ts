"use client";

import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { writePostWithAi } from "@/entities/post";
import { errorMessage } from "@/shared/lib/errors";

/** Запрос к ИИ из панели: ответ заменяет текст редактора, «Вернуть как было» откатывает замену. */
export const useAiPanel = (editor: Editor) => {
  const [instruction, setInstruction] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const run = async (text: string) => {
    if (!text.trim() || pending) return;

    setPending(true);
    setError(null);

    try {
      const html = await writePostWithAi(text.trim(), editor.isEmpty ? "" : editor.getHTML());
      const before = editor.getHTML();
      editor.chain().focus().setContent(html, { emitUpdate: true }).run();

      if (editor.getHTML() === before) {
        setError("Текст получился длиннее лимита. Попросите сделать его короче");
      } else {
        setInstruction("");
        setApplied(true);
      }
    } catch (failure) {
      setError(errorMessage(failure, "Не удалось получить ответ ИИ"));
    }

    setPending(false);
  };

  const undo = () => {
    editor.chain().focus().undo().run();
    setApplied(false);
  };

  return { instruction, setInstruction, pending, error, applied, run, undo };
};
