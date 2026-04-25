import type { PaginationInput } from '@afk/graphql';
import { createStore, type StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createRefCounter } from '@/utils/ref-count';

import type { CopilotClient } from './client';
import { createChatSessionStore } from './session-store';
import type { ChatSessionState } from './types';

export interface ChatSessionsState {
  activeId?: string;

  /** Cached sessions fetched from backend, indexed by sessionId */
  sessionsCache: Record<string, unknown>;

  /* ---------- Actions ---------- */
  acquire(args: {
    sessionId: string;
    client: CopilotClient;
  }): StoreApi<ChatSessionState>;
  release(sessionId: string): void;
  setActive(sessionId?: string): void;
  get(sessionId: string): StoreApi<ChatSessionState> | undefined;
  list(): string[];

  /**
   * Create a new copilot session on backend and register it locally.
   * The returned session id is also set as `activeId`.
   */
  createSession(args: {
    client: CopilotClient;
    options: Parameters<CopilotClient['createSession']>[0];
  }): Promise<string>;

  /**
   * Fetch sessions list from backend and cache the result in `sessionsCache`.
   * Returns the fetched session nodes.
   */
  fetchSessions(args: {
    client: CopilotClient;
    pagination: PaginationInput;
    options?: Parameters<CopilotClient['getSessions']>[1];
    signal?: AbortSignal;
  }): Promise<unknown[]>;
}

export function createChatSessionsStore() {
  const registry = createRefCounter<string, StoreApi<ChatSessionState>>({
    maxCacheSize: 10,
  });

  return createStore<ChatSessionsState>()(
    immer<ChatSessionsState>((set, get) => ({
      activeId: undefined,
      sessionsCache: {},

      acquire: ({ sessionId, client }) => {
        const currentState = get();
        const cachedMeta = registry.get(sessionId)
          ? undefined
          : (currentState.sessionsCache[sessionId] as unknown | undefined);

        return registry.acquire(sessionId, () =>
          createChatSessionStore({
            sessionId,
            client,
            initialMeta: cachedMeta ?? null,
          })
        );
      },

      release: (sessionId: string) => {
        registry.release(sessionId, () => {
          // cleanup activeId if needed
          set(state => {
            if (state.activeId === sessionId) state.activeId = undefined;
          });
        });
      },

      setActive: (sessionId?: string) => {
        set(state => {
          state.activeId = sessionId;
        });
      },

      get: (sessionId: string) => registry.get(sessionId),

      list: () => registry.list(),

      /** Implement createSession */
      createSession: async ({ client, options }) => {
        const sessionId = await client.createSession(options);

        // Preload meta of the newly created session for cache purpose
        let meta: unknown = null;
        try {
          meta = await client.getSession(sessionId);
        } catch {
          // ignore
        }

        set(state => {
          state.sessionsCache[sessionId] = meta ?? {};
          state.activeId = sessionId;
        });

        // Ensure a local store exists for the new session
        registry.acquire(sessionId, () =>
          createChatSessionStore({ sessionId, client })
        );

        return sessionId;
      },

      /** Implement fetchSessions */
      fetchSessions: async ({ client, pagination, options, signal }) => {
        const sessions = await client.getSessions(
          pagination,
          options as any,
          signal
        );
        if (sessions && Array.isArray(sessions)) {
          set(state => {
            for (const s of sessions) {
              if (s && typeof s === 'object' && 'sessionId' in s) {
                state.sessionsCache[(s as any).sessionId] = s;
              }
            }
          });
        }
        return sessions ?? [];
      },
    }))
  );
}
