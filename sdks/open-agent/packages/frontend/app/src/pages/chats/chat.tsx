import { Button, IconButton, toast } from '@afk/component';
import { CommentIcon } from '@blocksuite/icons/rc';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { ChatInterface } from '@/components/chat/chat-interface';
import {
  type ChatContext,
  clearCacheContexts,
  loadCacheContexts,
} from '@/components/chat-context';
import { DocPanelById } from '@/components/doc-panel/doc-panel';
import { OpenDocProvider } from '@/contexts/doc-panel-context';
import { useRefCounted } from '@/lib/hooks/use-ref-counted';
import { copyToClipboard } from '@/lib/utils';
import { copilotClient } from '@/store/copilot/client';
import { chatSessionsStore } from '@/store/copilot/sessions-instance';
import { useChatsMap, useLibraryStore } from '@/store/library';

import { AutoSidebarPadding } from '../layout/auto-sidebar-padding';
import { FavoriteAction } from '../library-dashboard';

export const ChatPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  useEffect(() => {
    if (searchParams.get('msg')) {
      // delete msg param immediately after mount
      navigate({ search: '' }, { replace: true });
    }
  }, [navigate, searchParams]);

  /* ---------------- Existing-session mode ---------------- */
  const sessionStore = useRefCounted(
    id,
    () =>
      id
        ? chatSessionsStore.getState().acquire({
            sessionId: id,
            client: copilotClient,
          })
        : null,
    () => {
      id && chatSessionsStore.getState().release(id);
    }
  );

  /* ---------------- Placeholder mode handlers ---------------- */
  const [isCreating, setIsCreating] = useState(false);

  const onSendPlaceholder = async (
    inputContent: string,
    config?: { tools: string[]; model: string }
  ) => {
    if (!inputContent.trim() || isCreating) return;
    setIsCreating(true);

    try {
      // Create backend session first
      const newSessionId = await chatSessionsStore.getState().createSession({
        client: copilotClient,
        options: {
          promptName: 'Chat With Open-Agent', // default prompt
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
      const contextId = newStore.getState().contextId;
      const cacheContexts = (await loadCacheContexts()) as ChatContext[];

      // update cached contexts
      await Promise.all(
        cacheContexts.map(async context => {
          if (context.type === 'file' && context.blob) {
            await copilotClient.addContextFile(context.blob, contextId);
          }
          if (context.type === 'file' && context.blobId) {
            await copilotClient.addContextFileExists(context.blobId, contextId);
          }
          if (context.type === 'chat') {
            await copilotClient.addContextChat(contextId, context.id);
          }
          if (context.type === 'doc') {
            await copilotClient.addContextDoc(contextId, context.id);
          }
        })
      );
      await clearCacheContexts();

      await newStore.getState().sendMessage(
        {
          content: inputContent.trim(),
        },
        config
      );

      // Navigate to URL with new session id
      navigate('/chats/' + newSessionId, { replace: true });
    } finally {
      setIsCreating(false);
    }
  };

  const [docId, setDocId] = useState<string>();

  const closeDoc = () => {
    setDocId(undefined);
  };
  const openDoc = (docId: string) => {
    setDocId(docId);
  };

  /* ---------------- Rendering ---------------- */
  return (
    <OpenDocProvider
      value={{
        openDoc,
        closeDoc,
      }}
    >
      <div className="flex-1 panel">
        <ChatInterface
          store={id && sessionStore ? sessionStore : undefined}
          placeholder="What can I help you with?"
          className="flex-1"
          placeholderTitle="What can I help you with?"
          onPlaceholderSend={onSendPlaceholder}
          isCreating={isCreating}
          message={searchParams.get('msg') ?? undefined}
          headerContent={<ChatPageHeader sessionId={id} />}
        />
      </div>
      {docId && (
        <div className="flex-1 panel">
          <DocPanelById docId={docId} onClose={closeDoc} />
        </div>
      )}
    </OpenDocProvider>
  );
};

export const ChatPageHeader = ({ sessionId }: { sessionId?: string }) => {
  const { toggleCollect } = useLibraryStore();
  const chatsMap = useChatsMap();
  const chat = sessionId ? chatsMap[sessionId] : undefined;

  const isFav = chat?.metadata?.collected;

  const toggle = useCallback(async () => {
    if (!sessionId) return;
    await toggleCollect('chat', sessionId);
  }, [sessionId, toggleCollect]);

  return (
    <div className="h-15 border-b-[0.5px] px-4 flex items-center justify-between">
      <AutoSidebarPadding className="text-sm font-medium text-text-primary truncate">
        {chat?.title ?? 'New Chat'}
      </AutoSidebarPadding>

      {chat ? (
        <div className="flex items-center gap-2">
          <FavoriteAction collected={!!isFav} setToggleAsync={toggle} />
          <IconButton icon={<CommentIcon />} />
          <Button
            variant="secondary"
            size="default"
            onClick={async () => {
              if (!sessionId) return;
              const link = `${window.location.origin}/chats/${sessionId}/playback`;
              await copyToClipboard(link);
              toast('Link copied to clipboard');
            }}
          >
            Share
          </Button>
        </div>
      ) : null}
    </div>
  );
};
