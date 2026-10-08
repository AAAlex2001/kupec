"use client";

import { useState } from "react";
import Button from "@/shared/ui/button";

type PhoneButtonProps = {
  phone: string;
};

/** «Показать контактный телефон»: по нажатию показывает номер, по номеру можно позвонить. */
const PhoneButton = ({ phone }: PhoneButtonProps) => {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <Button variant="ghost" href={`tel:${phone}`}>
        {phone}
      </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={() => setShown(true)}>
      Показать контактный телефон
    </Button>
  );
};

export default PhoneButton;
