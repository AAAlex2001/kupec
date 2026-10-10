import type { Editor } from "@tiptap/react";
import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/shared/ui/icons/types";

/** Дополнительная панель редактора: кнопка в панели инструментов открывает её над панелью. */
export type EditorPanel = {
  label: string;
  Icon: ComponentType<IconProps>;
  render: (editor: Editor) => ReactNode;
};
