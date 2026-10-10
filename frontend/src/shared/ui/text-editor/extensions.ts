import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { CharacterCount, Placeholder, UndoRedo } from "@tiptap/extensions";

/** Возможности редактора: ровно те теги, что пропускает сервер. */
export const editorExtensions = (placeholder: string, limit: number) => [
  Document,
  Paragraph,
  Text,
  HardBreak,
  Heading.configure({ levels: [2, 3] }),
  Bold,
  Italic,
  Underline,
  Blockquote,
  BulletList,
  OrderedList,
  ListItem,
  Link.configure({ openOnClick: false, defaultProtocol: "https", protocols: ["http", "https"] }),
  Placeholder.configure({ placeholder }),
  CharacterCount.configure({ limit }),
  UndoRedo,
];
