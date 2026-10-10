"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import styles from "./style.module.scss";

type EditorCounterProps = {
  editor: Editor;
};

/** Сколько символов в тексте: «184 символов». */
const EditorCounter = ({ editor }: EditorCounterProps) => {
  const count = useEditorState({
    editor,
    selector: ({ editor: current }) => current.storage.characterCount.characters(),
  });

  return <p className={styles.counter}>{count} символов</p>;
};

export default EditorCounter;
