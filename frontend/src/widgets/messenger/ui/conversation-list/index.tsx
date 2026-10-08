"use client";

import { useState } from "react";
import { ConversationItem, useConversations } from "@/entities/conversation";
import Input from "@/shared/ui/input";
import { SearchIcon } from "@/shared/ui/icons";
import Loader from "@/shared/ui/loader";
import Notice from "@/shared/ui/notice";
import Title from "@/shared/ui/title";
import styles from "./style.module.scss";

type ConversationListProps = {
  activeId?: number;
};

/** Список диалогов справа: заголовок, поиск и диалоги, свежие первыми. */
const ConversationList = ({ activeId }: ConversationListProps) => {
  const [query, setQuery] = useState("");
  const { items, error } = useConversations(query);

  return (
    <div className={styles.list}>
      <Title as="h1">Сообщения</Title>

      <Input
        value={query}
        onChange={setQuery}
        placeholder="Поиск по сообщениям"
        ariaLabel="Поиск по сообщениям"
        maxLength={100}
        icon={<SearchIcon />}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {!items && !error && <Loader />}
      {items?.length === 0 && <p className={styles.empty}>Диалогов пока нет</p>}

      <div className={styles.items}>
        {items?.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeId}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
