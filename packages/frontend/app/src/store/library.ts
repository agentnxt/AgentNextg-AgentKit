import {
  type GetCopilotHistoriesQuery,
  getCopilotHistoriesQuery,
  type GetUserDocsQuery,
  getUserDocsQuery,
  type GetUserFilesQuery,
  getUserFilesQuery,
  updateCopilotSessionMutation,
  updateUserDocsMutation,
  updateUserFilesMutation,
} from '@afk/graphql';
import { useMemo } from 'react';
import { create } from 'zustand';

import { gql } from '@/lib/gql';

export interface GenericLibraryMetadata {
  collected: boolean;
}
export interface ChatMetadata extends GenericLibraryMetadata {}
export interface DocMetadata extends GenericLibraryMetadata {}
export interface FileMetadata extends GenericLibraryMetadata {}

type MapMetadata<T, K extends GenericLibraryMetadata> = Omit<T, 'metadata'> & {
  metadata: K;
};

export type Chat = MapMetadata<
  NonNullable<
    GetCopilotHistoriesQuery['currentUser']
  >['copilot']['chats']['edges'][number]['node'],
  ChatMetadata
>;
export type Doc = MapMetadata<
  NonNullable<
    GetUserDocsQuery['currentUser']
  >['embedding']['docs']['edges'][number]['node'],
  DocMetadata
>;
export type File = MapMetadata<
  NonNullable<
    GetUserFilesQuery['currentUser']
  >['embedding']['files']['edges'][number]['node'],
  FileMetadata
>;

export type AllItem = Array<
  | ({
      type: 'chat';
    } & Chat)
  | ({
      type: 'doc';
    } & Doc)
  | ({
      type: 'file';
    } & File)
>;
export interface LibraryState {
  chats: Chat[];
  docs: Doc[];
  files: File[];
  loading: boolean;
  initialized: boolean;
  refresh: () => Promise<void>;
  toggleCollect: (type: 'chat' | 'doc' | 'file', id: string) => Promise<void>;
}

const togglingMap = new Map<string, boolean>();

let abortPrevFetch: (() => void) | null = null;

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  loading: false,
  initialized: false,
  chats: [],
  docs: [],
  files: [],
  refresh: async () => {
    console.debug('library:refresh has-prev-fetch', Boolean(abortPrevFetch));
    if (abortPrevFetch) {
      abortPrevFetch();
    }

    const controller = new AbortController();
    abortPrevFetch = () => controller.abort();

    set({ loading: true });
    try {
      const [chatsRes, docsRes, filesRes] = await Promise.allSettled([
        gql({
          query: getCopilotHistoriesQuery,
          variables: {
            pagination: {
              first: 2 ** 10,
            },
          },
          signal: controller.signal,
        }),
        gql({
          query: getUserDocsQuery,
          variables: {
            pagination: {
              first: 2 ** 10,
            },
          },
          signal: controller.signal,
        }),
        gql({
          query: getUserFilesQuery,
          variables: {
            pagination: {
              first: 2 ** 10,
            },
          },
          signal: controller.signal,
        }),
      ]);
      let docs: Doc[] = [],
        chats: Chat[] = [],
        files: File[] = [];
      if (chatsRes.status === 'fulfilled') {
        chats =
          chatsRes.value.currentUser?.copilot.chats.edges.map(edge => ({
            ...edge.node,
            metadata: JSON.parse(edge.node.metadata || '{}') as ChatMetadata,
          })) ?? [];
        set({ chats });
      }
      if (docsRes.status === 'fulfilled') {
        docs =
          docsRes.value.currentUser?.embedding.docs.edges.map(edge => ({
            ...edge.node,
            metadata: JSON.parse(edge.node.metadata || '{}') as DocMetadata,
          })) ?? [];
        set({ docs });
      }
      if (filesRes.status === 'fulfilled') {
        files =
          filesRes.value.currentUser?.embedding.files.edges.map(edge => ({
            ...edge.node,
            metadata: JSON.parse(edge.node.metadata || '{}') as FileMetadata,
          })) ?? [];
        set({ files });
      }

      set({ initialized: true });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
      abortPrevFetch = null;
    }
  },
  toggleCollect: async (type, id) => {
    if (togglingMap.has(id)) return;

    togglingMap.set(id, true);

    try {
      console.debug('library:toggleCollect request start', type, id);
      if (type === 'chat') {
        const chat = get().chats.find(chat => chat.sessionId === id);
        if (!chat) return;

        const newMeta = {
          ...chat.metadata,
          collected: !chat.metadata.collected,
        };

        // update in-memory data
        set({
          chats: get().chats.map(item =>
            item.sessionId === id
              ? {
                  ...item,
                  updatedAt: new Date().toISOString(),
                  metadata: newMeta,
                }
              : item
          ),
        });

        // update server
        await gql({
          query: updateCopilotSessionMutation,
          variables: {
            options: {
              sessionId: id,
              metadata: JSON.stringify(newMeta),
            },
          },
        });
      }

      if (type === 'doc') {
        const doc = get().docs.find(doc => doc.docId === id);
        if (!doc) return;
        const newMeta = { ...doc.metadata, collected: !doc.metadata.collected };

        set({
          docs: get().docs.map(item =>
            item.docId === id
              ? {
                  ...item,
                  updatedAt: new Date().toISOString(),
                  metadata: newMeta,
                }
              : item
          ),
        });

        // update server
        await gql({
          query: updateUserDocsMutation,
          variables: {
            docId: id,
            metadata: JSON.stringify(newMeta),
          },
        });
      }

      if (type === 'file') {
        const file = get().files.find(file => file.fileId === id);
        if (!file) return;
        const newMeta = {
          ...file.metadata,
          collected: !file.metadata.collected,
        };

        // update server
        await gql({
          query: updateUserFilesMutation,
          variables: {
            fileId: id,
            metadata: JSON.stringify(newMeta),
          },
        });
      }

      console.debug('library:toggleCollect request end', type, id);
      await get().refresh();
      console.debug('library:toggleCollect refresh end', type, id);
    } catch (error) {
      console.error(error);
    } finally {
      togglingMap.delete(id);
    }
  },
}));

export const useAllItems = () => {
  const { docs, chats, files } = useLibraryStore();
  return useMemo(
    () =>
      [
        ...docs.map(doc => ({ type: 'doc', ...doc })),
        ...chats.map(chat => ({ type: 'chat', ...chat })),
        ...files.map(file => ({ type: 'file', ...file })),
      ].sort((a, b) => {
        return (
          new Date((b as any).updatedAt ?? b.createdAt).getTime() -
          new Date((a as any).updatedAt ?? a.createdAt).getTime()
        );
      }),
    [chats, docs, files]
  );
};

export const useChatsMap = () => {
  const { chats } = useLibraryStore();
  return useMemo(
    () =>
      chats.reduce(
        (acc, chat) => {
          acc[chat.sessionId] = chat;
          return acc;
        },
        {} as Record<string, Chat>
      ),
    [chats]
  );
};

export const useDocsMap = () => {
  const { docs } = useLibraryStore();
  return useMemo(
    () =>
      docs.reduce(
        (acc, doc) => {
          acc[doc.docId] = doc;
          return acc;
        },
        {} as Record<string, Doc>
      ),
    [docs]
  );
};

export const useFilesMap = () => {
  const { files } = useLibraryStore();
  return useMemo(
    () =>
      files.reduce(
        (acc, file) => {
          acc[file.fileId] = file;
          return acc;
        },
        {} as Record<string, File>
      ),
    [files]
  );
};
