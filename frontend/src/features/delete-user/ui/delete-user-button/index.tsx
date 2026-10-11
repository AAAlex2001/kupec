"use client";

import type { AdminUser } from "@/entities/user";
import Button from "@/shared/ui/button";
import ConfirmModal from "@/shared/ui/confirm-modal";
import { TrashIcon } from "@/shared/ui/icons";
import { useDeleteUser } from "../../model/use-delete-user";

type DeleteUserButtonProps = {
  user: AdminUser;
};

const WARNING =
  "Вместе с ним удалятся все его объявления, публикации, комментарии, отзывы, переписка и фото. Отменить это нельзя.";

/** Кнопка «Удалить пользователя» с подтверждением. */
const DeleteUserButton = ({ user }: DeleteUserButtonProps) => {
  const deletion = useDeleteUser(user.id);
  const name = user.name ?? user.email;

  return (
    <>
      <Button variant="danger" onClick={deletion.show}>
        <TrashIcon />
        Удалить пользователя
      </Button>

      <ConfirmModal
        open={deletion.open}
        title={`Удалить «${name}»?`}
        text={deletion.error ?? WARNING}
        confirmLabel="Удалить"
        pending={deletion.pending}
        onConfirm={deletion.remove}
        onClose={deletion.close}
      />
    </>
  );
};

export default DeleteUserButton;
