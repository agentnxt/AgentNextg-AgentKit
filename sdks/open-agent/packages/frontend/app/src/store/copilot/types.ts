import type {
  CopilotContextChatOrDoc,
  CopilotContextFile,
  StreamObject,
} from '@afk/graphql';

import type { CopilotClient } from './client';

export interface ChatMessage {
  id: string | null;
  content: string;
  role: 'user' | 'assistant' | 'system' | string;
  createdAt?: string;
  streamObjects?: StreamObject[] | null;
  // Other server-returned fields are allowed
  [key: string]: unknown;
}

export interface SessionMeta {
  title?: string | null;
  createdAt?: string | null;
  pinned?: boolean | null;
  modelId?: string | null;

  // Additional meta information coming from backend
  [key: string]: unknown;
}

export interface SessionFlags {
  isInitializing: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  isStreaming: boolean;
}

export interface ChatSessionState extends SessionFlags {
  // Identifiers
  sessionId: string;
  contextId: string;

  error?: Error;

  // Data
  meta: SessionMeta | null;
  messages: ChatMessage[];
  rawMessages: ChatMessage[]; // unmerged messages
  contextFiles: CopilotContextFile[];
  contextChats: CopilotContextChatOrDoc[];
  contextDocs: CopilotContextChatOrDoc[];

  // Abort controller for canceling ongoing requests
  abortController: AbortController | null;

  /* ---------------- Actions -------------- */
  init(): Promise<void>;
  reload(): Promise<void>;
  abortSend(): void;
  sendMessage(
    options: Omit<SendMessageOptions, 'sessionId'>,
    config?: {
      tools: string[];
      model: string;
    }
  ): Promise<void>;
  cleanup(sessionIds: string[]): Promise<void>;
  clearError(): void;
  // contexts
  loadContextId(): Promise<void>;
  loadContexts(): Promise<void>;

  addFileContext(file: File): Promise<void>;
  addFileContextExists(blobId: string): Promise<void>;
  removeFileContext(fileId: string): Promise<void>;

  addDocContext(docId: string): Promise<void>;
  removeDocContext(docId: string): Promise<void>;

  addChatContext(sessionId: string): Promise<void>;
  removeChatContext(chatId: string): Promise<void>;

  /** Toggle pinned state for this session. */
  togglePin(): Promise<void>;
}

export type SendMessageOptions = Parameters<CopilotClient['createMessage']>[0];
export type UpdateSessionOptions = Parameters<
  CopilotClient['updateSession']
>[0];

export type TodoListItem = {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'processing' | 'pending';
};

export type MarkTodoArgs = {
  status: 'completed' | 'processing';
  todoId: string;
  todoListId: string;
};
