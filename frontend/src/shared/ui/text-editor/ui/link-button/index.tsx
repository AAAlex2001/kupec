"use client";

import type { Editor } from "@tiptap/react";
import { useState } from "react";
import Button from "@/shared/ui/button";
import { LinkIcon } from "@/shared/ui/icons";
import { addLink } from "../../tools";
import LinkModal from "../link-modal";

type LinkButtonProps = {
  editor: Editor;
  active: boolean;
};

/** Кнопка «Ссылка»: на ссылке — убирает её, иначе спрашивает адрес. */
const LinkButton = ({ editor, active }: LinkButtonProps) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (active) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Button variant="tool" size="icon" ariaLabel="Ссылка" ariaPressed={active} onClick={toggle}>
        <LinkIcon />
      </Button>

      <LinkModal
        open={open}
        onSave={(href) => {
          addLink(editor, href);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default LinkButton;
