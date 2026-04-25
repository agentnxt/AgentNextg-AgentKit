import type { StreamObject } from '@afk/graphql';
import { produce } from 'immer';
import { z } from 'zod';
import { createStore, type StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { useLibraryStore } from '../library';
import type { CopilotClient } from './client';
import { toTextStream } from './event-source';
import type {
  ChatMessage,
  ChatSessionState,
  SendMessageOptions,
  SessionFlags,
} from './types';
import { mergeStreamObjects } from './utils';

export const StreamObjectSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text-delta'),
    textDelta: z.string(),
  }),
  z.object({
    type: z.literal('reasoning'),
    textDelta: z.string(),
  }),
  z.object({
    type: z.literal('tool-call'),
    toolCallId: z.string(),
    toolName: z.string(),
    args: z.record(z.any()),
  }),
  z.object({
    type: z.literal('tool-result'),
    toolCallId: z.string(),
    toolName: z.string(),
    args: z.record(z.any()),
    result: z.any(),
  }),
  z.object({
    type: z.literal('tool-incomplete-result'),
    toolCallId: z.string(),
    data: z.any(),
  }),
]);

// Helper to apply immer mutation inside async flow
const withFlag = <K extends keyof SessionFlags>(
  store: StoreApi<ChatSessionState>,
  flag: K,
  fn: () => Promise<void>
) => {
  const { setState } = store;
  return (async () => {
    // set flag true, clear error
    setState(
      produce((draft: ChatSessionState) => {
        draft[flag] = true;
        draft.error = undefined;
      })
    );

    try {
      await fn();
    } catch (err) {
      setState(
        produce((draft: ChatSessionState) => {
          draft.error = (err as Error) ?? new Error('Unknown error');
        })
      );
    } finally {
      // reset flag
      setState(
        produce((draft: ChatSessionState) => {
          draft[flag] = false;
        })
      );
    }
  })();
};

export function createChatSessionStore(params: {
  sessionId: string;
  client: CopilotClient;
  initialMeta?: unknown | null;
}): StoreApi<ChatSessionState> {
  const { sessionId, client, initialMeta } = params;

  const store = createStore<ChatSessionState>()(
    immer<ChatSessionState>((set, get) => ({
      /* ---------- Data ---------- */
      sessionId,
      meta: (initialMeta as any) ?? null,
      messages: (initialMeta && (initialMeta as any).messages) ?? [],
      rawMessages: (initialMeta && (initialMeta as any).messages) ?? [],
      contextId: '',
      contextFiles: [],
      contextChats: [],
      contextDocs: [],
      abortController: null,

      /* ---------- Flags ---------- */
      isInitializing: true,
      isLoading: false,
      isSubmitting: false,
      isStreaming: false,
      error: undefined,

      /* ---------- Actions ---------- */
      init: async () => {
        await withFlag(store, 'isInitializing', async () => {
          // Mark the session as loading while we fetch the initial data.
          store.setState(
            produce((draft: ChatSessionState) => {
              draft.isLoading = true;
            })
          );
          const meta = await client.getSession(sessionId);
          const histories = await client.getHistories(
            {},
            {
              sessionId,
              withMessages: true,
            }
          );
          await get().loadContextId();
          await get().loadContexts();
          const historyEntry = Array.isArray(histories)
            ? histories.find((h: any) => h.sessionId === sessionId)
            : undefined;

          const initialMessages =
            historyEntry?.messages ?? meta?.messages ?? [];

          // Merge any streamObjects inside the loaded messages to ensure consistency
          const mergedMessages: ChatMessage[] = initialMessages.map(
            (msg: any) => {
              if (msg?.streamObjects && Array.isArray(msg.streamObjects)) {
                try {
                  return {
                    ...msg,
                    streamObjects: mergeStreamObjects(
                      msg.streamObjects as StreamObject[]
                    ),
                  } as ChatMessage;
                } catch {
                  // If merge fails for any reason, fall back to original message
                  return msg;
                }
              }
              return msg;
            }
          );

          set(state => {
            state.meta = meta ?? state.meta ?? null;
            if (state.messages.length === 0) {
              state.messages = mergedMessages;
            }
            state.rawMessages = initialMessages;
          });

          // Data loaded → reset loading flag
          store.setState(
            produce((draft: ChatSessionState) => {
              draft.isLoading = false;
            })
          );
        });
      },
      loadContextId: async () => {
        const contextId = await client.createContext(sessionId);
        set(state => {
          state.contextId = contextId;
        });
      },
      reload: async () => {
        const { init } = get();
        await init();
      },

      abortSend() {
        const controller = get().abortController;
        if (controller) {
          controller.abort();
          set(state => {
            state.abortController = null;
            state.isStreaming = false;
            state.isSubmitting = false;
          });
        }
      },

      sendMessage: async (
        options: SendMessageOptions,
        config?: {
          tools: string[];
          model: string;
        }
      ) => {
        if (!options.content || !options.content.trim()) {
          return;
        }

        const content = options.content.trim();

        // Create AbortController for this message
        const abortController = new AbortController();
        set(state => {
          state.abortController = abortController;
        });

        await withFlag(store, 'isSubmitting', async () => {
          // Create user message on backend
          const messageId = await client.createMessage({
            ...options,
            content,
            sessionId,
          });

          // Local optimistic user & assistant messages
          const userMsg: ChatMessage = {
            id: messageId ?? null,
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
          };
          const assistantMsg: ChatMessage = {
            id: null,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
          };

          set(state => {
            state.messages.push(userMsg);
            state.messages.push(assistantMsg);
          });

          // Stream assistant response in background
          const stream = async () => {
            store.setState(
              produce((draft: ChatSessionState) => {
                draft.isStreaming = true;
              })
            );

            try {
              const es = client.chatTextStream({
                sessionId,
                messageId: messageId ?? undefined,
                signal: abortController.signal,
                tools: config?.tools,
                model: config?.model,
              });

              for await (const ev of toTextStream(es, {
                signal: abortController.signal,
              })) {
                if (ev.type === 'message') {
                  const chunk = ev.data;
                  store.setState(
                    produce((draft: ChatSessionState) => {
                      const last = draft.messages[draft.messages.length - 1];

                      if (last && last.role === 'assistant') {
                        try {
                          const parsed = StreamObjectSchema.parse(
                            JSON.parse(chunk)
                          ) as StreamObject;
                          const streamObjects = mergeStreamObjects([
                            ...(last.streamObjects ?? []),
                            parsed,
                          ]);
                          draft.messages[draft.messages.length - 1] = {
                            ...last,
                            streamObjects,
                          };
                        } catch {
                          draft.messages[draft.messages.length - 1] = {
                            ...last,
                            content: last.content + chunk,
                          };
                        }
                      }
                    })
                  );
                }
                // ignoring attachment events for MVP
              }
            } catch (err) {
              store.setState(
                produce((draft: ChatSessionState) => {
                  draft.error = (err as Error) ?? new Error('Stream error');
                  draft.abortController = null;
                })
              );
            } finally {
              store.setState(
                produce((draft: ChatSessionState) => {
                  draft.isStreaming = false;
                  draft.abortController = null;
                  useLibraryStore.getState().refresh();
                })
              );
            }
          };

          void stream();
        }).catch(() => {
          // Clean up AbortController if withFlag fails
          set(state => {
            state.abortController = null;
          });
        });
      },

      // Toggle pin status for this session
      togglePin: async () => {
        const pinned = get().meta?.pinned ?? false;
        await withFlag(store, 'isSubmitting', async () => {
          await client.updateSession({
            sessionId,
            pinned: !pinned,
          });

          // Refresh meta
          const meta = await client.getSession(sessionId);
          set(state => {
            state.meta = meta ?? state.meta;
          });
        });
      },

      cleanup: async (sessionIds: string[]) => {
        await withFlag(store, 'isSubmitting', async () => {});
      },

      clearError: () => {
        set(state => {
          state.error = undefined;
        });
      },

      loadContexts: async () => {
        const contextId = get().contextId;
        const contexts = await client.getContextFiles(sessionId, contextId);

        set(state => {
          state.contextFiles = contexts?.files ?? [];
          state.contextChats = contexts?.chats ?? [];
          state.contextDocs = contexts?.docs ?? [];
        });
      },
      addFileContext: async (file: File) => {
        const contextId = get().contextId;
        await client.addContextFile(file, contextId);
        get().loadContexts();
      },
      addFileContextExists: async (blobId: string) => {
        const contextId = get().contextId;
        await client.addContextFileExists(blobId, contextId);
        get().loadContexts();
      },
      removeFileContext: async (fileId: string) => {
        const contextId = get().contextId;
        await client.removeContextFile(contextId, fileId);
        get().loadContexts();
      },

      addChatContext: async (sessionId: string) => {
        const contextId = get().contextId;
        await client.addContextChat(contextId, sessionId);
        get().loadContexts();
      },

      removeChatContext: async (chatId: string) => {
        const contextId = get().contextId;
        await client.removeContextChat(contextId, chatId);
        get().loadContexts();
      },

      addDocContext: async (docId: string) => {
        const contextId = get().contextId;
        await client.addContextDoc(contextId, docId);
        get().loadContexts();
      },

      removeDocContext: async (docId: string) => {
        const contextId = get().contextId;
        await client.removeContextDoc(contextId, docId);
        get().loadContexts();
      },
    }))
  );

  // Perform initial load in background
  void store.getState().init();

  return store;
}
