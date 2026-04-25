import { Loading, observeResize } from '@afk/component';
import { useCallback, useEffect, useRef } from 'react';
import { type StoreApi, useStore } from 'zustand';

import { ChatInput } from '@/components/chat-input';
import { MessageRenderer } from '@/pages/chats/renderers/message';
import type { ChatSessionState } from '@/store/copilot/types';

import { AggregatedTodoList } from './aggregated-todo-list';
import { DownArrow, type DownArrowRef } from './chat-arrow';
import { MessagesProvider } from './messages.context';
import { ChatScrollerProvider } from './use-chat-scroller';

// Placeholder component for when no session exists
interface ChatPlaceholderProps {
  placeholder?: string;
  placeholderTitle?: string;
  onPlaceholderSend?: (
    input: string,
    config?: { tools: string[]; model: string }
  ) => Promise<void>;
  isCreating?: boolean;
  message?: string;
}

const ChatPlaceholder = ({
  placeholder = 'What are your thoughts?',
  placeholderTitle = 'What can I help you with?',
  onPlaceholderSend,
  isCreating = false,
  message,
}: ChatPlaceholderProps) => {
  const onSend = useCallback(
    async (input: string, config?: { tools: string[]; model: string }) => {
      if (onPlaceholderSend) await onPlaceholderSend(input, config);
    },
    [onPlaceholderSend]
  );

  useEffect(() => {
    if (message) onSend(message);
  }, [message, onSend]);

  return (
    <div className="flex flex-col justify-center h-full p-4 gap-4 max-w-[800px] mx-auto">
      <div className="text-[26px] font-medium text-center mb-9">
        {placeholderTitle}
      </div>
      <ChatInput
        onSend={onSend}
        sending={isCreating}
        placeholder={placeholder}
        isCreating={isCreating}
      />
    </div>
  );
};

// Session component for when a session exists
interface ChatSessionProps {
  store: StoreApi<ChatSessionState>;
  placeholder?: string;
  showDocumentContext?: boolean;
  documentTitle?: string;
  className?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const ChatSession = ({
  store,
  placeholder = 'What are your thoughts?',
  showDocumentContext = false,
  documentTitle,
  className = '',
  headerContent,
  footerContent,
}: ChatSessionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const downArrowRef = useRef<DownArrowRef>(null);

  const messages = useStore(store, s => s.messages);
  const isSubmitting = useStore(store, s => s.isSubmitting);
  const isStreaming = useStore(store, s => s.isStreaming);
  const isLoading = useStore(store, s => s.isLoading);

  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current?.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  const onSend = async (
    input: string,
    config?: { tools: string[]; model: string }
  ) => {
    await store.getState().sendMessage({ content: input }, config);
    scrollToBottom();
  };

  const containerClasses = `flex flex-col h-full ${className}`;

  const checkIsBottom = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return null;

    const threshold = 50;

    const scrollTop = scrollContainer.scrollTop;
    const clientHeight = scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;

    const isAtBottom = scrollTop + clientHeight + threshold >= scrollHeight;

    // avoid re-rendering when scroll to bottom changes
    if (isAtBottom) {
      downArrowRef.current?.hide();
    } else {
      downArrowRef.current?.show();
    }
    return isAtBottom;
  }, []);

  useEffect(() => {
    isLoading;
    if (!messagesContainerRef.current) return;
    checkIsBottom();
    return observeResize(messagesContainerRef.current, checkIsBottom);
  }, [checkIsBottom, isLoading]);

  return (
    <div className={containerClasses}>
      {headerContent}

      <div className="flex-1 h-0 flex flex-col relative">
        {messages.length === 0 && isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loading size={24} />
          </div>
        ) : null}
        <ChatScrollerProvider
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto py-4"
          onScroll={checkIsBottom}
        >
          <div className="w-full h-fit" ref={messagesContainerRef}>
            {showDocumentContext && documentTitle && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">
                  Document Context
                </div>
                <div className="text-sm text-blue-800">{documentTitle}</div>
              </div>
            )}

            <MessagesProvider messages={messages}>
              <div className="max-w-[832px] mx-auto px-4 w-full  flex flex-col  [&>*:not(:first-child)]:mt-4">
                {messages.map((m, idx) => (
                  <MessageRenderer
                    key={m.id ?? idx}
                    message={m}
                    isStreaming={isStreaming && idx === messages.length - 1}
                  />
                ))}
              </div>
            </MessagesProvider>
          </div>
        </ChatScrollerProvider>

        <DownArrow
          ref={downArrowRef}
          onClick={scrollToBottom}
          loading={isStreaming}
        />
      </div>

      <div className="max-w-[832px] px-4 mx-auto w-full py-4">
        {/* Aggregated Todo List - positioned above input */}
        <AggregatedTodoList store={store} />
        <ChatInput
          onSend={onSend}
          sending={isSubmitting}
          streaming={isStreaming}
          onAbort={store.getState().abortSend}
          store={store}
          placeholder={placeholder}
        />
      </div>

      {footerContent}
    </div>
  );
};

export interface ChatInterfaceProps {
  store?: StoreApi<ChatSessionState>;
  placeholder?: string;
  showDocumentContext?: boolean;
  documentTitle?: string;
  className?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  // For placeholder mode when no store is provided
  placeholderTitle?: string;
  onPlaceholderSend?: (
    input: string,
    config?: { tools: string[]; model: string }
  ) => Promise<void>;
  isCreating?: boolean;
  message?: string;
}

/**
 * Generic chat interface component that can be used in different contexts
 */
export const ChatInterface = ({
  store,
  placeholder = 'What are your thoughts?',
  showDocumentContext = false,
  documentTitle,
  className = '',
  headerContent,
  footerContent,
  placeholderTitle = 'What can I help you with?',
  onPlaceholderSend,
  isCreating = false,
  message,
}: ChatInterfaceProps) => {
  // If no store is provided, render the placeholder component
  if (!store) {
    return (
      <ChatPlaceholder
        placeholder={placeholder}
        placeholderTitle={placeholderTitle}
        onPlaceholderSend={onPlaceholderSend}
        isCreating={isCreating}
        message={message}
      />
    );
  }

  // If store is provided, render the session component
  return (
    <ChatSession
      store={store}
      placeholder={placeholder}
      showDocumentContext={showDocumentContext}
      documentTitle={documentTitle}
      className={className}
      headerContent={headerContent}
      footerContent={footerContent}
    />
  );
};
