"use client";

import { useCountdown } from "@/shared/lib/use-countdown";
import Button from "@/shared/ui/button";
import { MessageCircleMoreIcon } from "@/shared/ui/icons";

type ResendButtonProps = {
  seconds: number;
  disabled: boolean;
  onClick: () => void;
};

/** «Отправить код повторно»: доступна, когда истечёт пауза между письмами. */
const ResendButton = ({ seconds, disabled, onClick }: ResendButtonProps) => {
  const left = useCountdown(seconds);

  return (
    <Button variant="secondary" disabled={disabled || left > 0} onClick={onClick}>
      <MessageCircleMoreIcon />
      {left > 0 ? `Отправить повторно через ${left} с` : "Отправить код повторно"}
    </Button>
  );
};

export default ResendButton;
