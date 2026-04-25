import { createContext, useContext } from 'react';

import type { ChatMessage } from '@/store/copilot/types';

const MessagesContext = createContext<ChatMessage[]>([]);

export const MessagesProvider = ({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: ChatMessage[];
}) => {
  return (
    <MessagesContext.Provider value={messages}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useChatMessages = () => {
  return useContext(MessagesContext);
};
