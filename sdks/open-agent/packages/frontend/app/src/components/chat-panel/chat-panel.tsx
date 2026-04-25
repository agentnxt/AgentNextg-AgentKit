import { useState } from 'react';

import { ChatInterface } from '@/components/chat/chat-interface';
import { useRefCounted } from '@/lib/hooks/use-ref-counted';
import { copilotClient } from '@/store/copilot/client';
import { chatSessionsStore } from '@/store/copilot/sessions-instance';

export function ChatPanel({ docId }: { docId?: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  // Create or get session store
  const sessionStore = useRefCounted(
    sessionId,
    () =>
      sessionId
        ? chatSessionsStore.getState().acquire({
            sessionId,
            client: copilotClient,
          })
        : null,
    () => {
      sessionId && chatSessionsStore.getState().release(sessionId);
    }
  );

  const onSendPlaceholder = async (inputContent: string) => {
    if (!inputContent.trim() || isCreating) return;
    setIsCreating(true);

    try {
      // Create backend session first
      const newSessionId = await chatSessionsStore.getState().createSession({
        client: copilotClient,
        options: {
          promptName: 'Chat With Open-Agent',
          docId,
        },
      });

      // Send the first message via the newly created store
      const newStore =
        chatSessionsStore.getState().get(newSessionId) ??
        chatSessionsStore.getState().acquire({
          sessionId: newSessionId,
          client: copilotClient,
        });

      // upload context first
      await newStore.getState().loadContextId();

      await newStore.getState().sendMessage({
        content: inputContent.trim(),
      });

      setSessionId(newSessionId);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ChatInterface
      store={sessionId && sessionStore ? sessionStore : undefined}
      placeholder="What can I help you with?"
      className="flex-1"
      placeholderTitle="What can I help you with?"
      onPlaceholderSend={onSendPlaceholder}
      isCreating={isCreating}
    />
  );
}
