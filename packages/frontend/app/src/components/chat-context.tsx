import { Divider, IconButton, Menu, MenuItem, RowInput } from '@afk/component';
import type { CopilotContextChatOrDoc, CopilotContextFile } from '@afk/graphql';
import {
  AttachmentIcon,
  CloseIcon,
  PageIcon,
  SearchIcon,
} from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import { type IDBPDatabase, openDB } from 'idb';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { create, type StoreApi, useStore } from 'zustand';

import { ChatIcon } from '@/icons/chat';
import { cn } from '@/lib/utils';
import type { ChatSessionState } from '@/store/copilot/types';
import { useChatsMap, useDocsMap, useLibraryStore } from '@/store/library';

import * as styles from './chat-input.css';
import { FileIconRenderer } from './file-icon-renderer';

export type ChatContextChat = {
  type: 'chat';
  id: string;
};
export type ChatContextDoc = {
  type: 'doc';
  id: string;
};
export type ChatContextFile = {
  type: 'file';
  id: string;
  blob?: File;
  blobId?: string;
  mineType: string;
  name: string;
};

export type ChatContext = ChatContextChat | ChatContextDoc | ChatContextFile;

let db: IDBPDatabase<{ cache: ChatContext[] }> | null = null;
async function initDB() {
  if (db) return db;
  db = await openDB('chat-context-cache', 1, {
    upgrade(db) {
      db.createObjectStore('cache');
    },
  });
  return db;
}
export async function loadCacheContexts() {
  const db = await initDB();
  const cache = await db.getAll('cache');
  return cache;
}
async function saveCacheContexts(contexts: ChatContext[]) {
  const db = await initDB();
  for (const context of contexts) {
    await db.put('cache', context, context.id);
  }
}
async function removeCacheContexts(ids: string[]) {
  const db = await initDB();
  for (const id of ids) {
    await db.delete('cache', id);
  }
}
export async function clearCacheContexts() {
  const db = await initDB();
  await db.clear('cache');
}

const useContextCache = create<{
  contexts: ChatContext[];
  setContexts: (contexts: ChatContext[]) => Promise<void>;
  loadContexts: () => Promise<ChatContext[]>;
  removeContexts: (ids: string[]) => Promise<void>;
}>()(set => ({
  contexts: [] as ChatContext[],
  setContexts: async (contexts: ChatContext[]) => {
    await saveCacheContexts(contexts);
    set({ contexts });
  },
  loadContexts: async () => {
    const contexts = await loadCacheContexts();
    set({ contexts });
    return contexts;
  },
  removeContexts: async (ids: string[]) => {
    await removeCacheContexts(ids);
    set(state => ({
      contexts: state.contexts.filter(c => !ids.includes(c.id)),
    }));
  },
}));

const ChatContextPreview = ({
  context,
  onRemove,
}: {
  context: ChatContextChat;
  onRemove: () => void;
}) => {
  const chatsMap = useChatsMap();
  const chat = chatsMap[context.id];
  if (!chat) return null;

  return (
    <div className={styles.contextPreview}>
      <div className={styles.contextPreviewIcon}>
        <ChatIcon />
      </div>
      <div className={styles.contextPreviewTitle}>{chat.title}</div>
      <IconButton icon={<CloseIcon />} variant="plain" onClick={onRemove} />
    </div>
  );
};

const DocContextPreview = ({
  context,
  onRemove,
}: {
  context: ChatContextDoc;
  onRemove: () => void;
}) => {
  const docsMap = useDocsMap();
  const doc = docsMap[context.id];
  if (!doc) return null;

  return (
    <div className={styles.contextPreview}>
      <div className={styles.contextPreviewIcon}>
        <PageIcon />
      </div>
      <div className={styles.contextPreviewTitle}>{doc.title}</div>
      <IconButton icon={<CloseIcon />} variant="plain" onClick={onRemove} />
    </div>
  );
};

const FileContextPreview = ({
  context,
  onRemove,
}: {
  context: ChatContextFile;
  onRemove: () => void;
}) => {
  const file = context.blob;
  const mineType = context.mineType ?? file?.type;
  const fileName = context.name ?? file?.name;

  return (
    <div className={styles.contextPreview}>
      <div className={styles.contextPreviewIcon}>
        <FileIconRenderer
          mimeType={mineType}
          blob={context.blob}
          blobId={context.blobId}
        />
      </div>
      <div className={styles.contextPreviewTitle}>{fileName}</div>
      <IconButton icon={<CloseIcon />} variant="plain" onClick={onRemove} />
    </div>
  );
};

export const ContextSelectorMenu = ({
  children,
  store,
}: {
  children: React.ReactNode;
  store?: StoreApi<ChatSessionState>;
}) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { docs, files, chats } = useLibraryStore();
  const { setContexts, loadContexts } = useContextCache();

  const [search, setSearch] = useState('');
  const [filteredDocs, setFilteredDocs] = useState(docs);
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [filteredChats, setFilteredChats] = useState(chats);

  useEffect(() => {
    startTransition(() => {
      setFilteredDocs(
        docs.filter(doc =>
          doc.title.toLowerCase().includes(search.toLowerCase())
        )
      );
      setFilteredFiles(
        files.filter(file =>
          file.fileName.toLowerCase().includes(search.toLowerCase())
        )
      );
      setFilteredChats(
        chats.filter(
          chat =>
            chat.title &&
            chat.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    });
  }, [chats, docs, files, search]);

  const handleAdd = async (updates: ChatContext[] | ChatContext) => {
    const prevContexts = store ? ([] as ChatContext[]) : await loadContexts();
    const targets = Array.isArray(updates) ? updates : [updates];

    const newContexts = [...prevContexts];
    for (const target of targets) {
      const index = newContexts.findIndex(c => c.id === target.id);
      if (index === -1) {
        newContexts.push(target);
      } else {
        newContexts[index] = target;
      }
    }

    if (store) {
      await Promise.all(
        targets.map(target => {
          if (target.type === 'file') {
            if (target.blob) {
              return store.getState().addFileContext(target.blob);
            } else if (target.blobId) {
              return store.getState().addFileContextExists(target.blobId);
            }
          }
          if (target.type === 'chat') {
            return store.getState().addChatContext(target.id);
          }
          if (target.type === 'doc') {
            return store.getState().addDocContext(target.id);
          }
          return Promise.resolve();
        })
      );
    } else {
      await setContexts(newContexts);
    }
  };

  return (
    <Menu
      contentOptions={{ style: { padding: 0 } }}
      rootOptions={{
        open,
        onOpenChange: setOpen,
      }}
      items={
        <div className="max-h-[400px] max-w-[280px] overflow-y-auto rounded-lg">
          {/* Search */}
          <div
            className={cn(
              'px-1 py-2 pl-3 w-full min-w-[200px] sticky top-0',
              'gap-[6px] flex items-center',
              'border-b-[0.5px] bg-white'
            )}
          >
            <SearchIcon
              className="text-xl w-5 h-5 shrink-0"
              style={{ color: cssVarV2.icon.primary }}
            />
            <RowInput
              className="w-full h-[30px] focus:outline-none"
              placeholder="Search"
              value={search}
              onKeyDown={e => {
                e.stopPropagation();
              }}
              onChange={setSearch}
            />
          </div>

          {/* Chats */}
          {filteredChats.length === 0 ? null : (
            <div className="flex flex-col gap-[2px] px-2">
              <div className={styles.groupLabel}>Chats</div>
              {filteredChats.map(chat => {
                return (
                  <MenuItem
                    onClick={() =>
                      handleAdd({ type: 'chat', id: chat.sessionId })
                    }
                    key={chat.sessionId}
                    prefixIcon={<ChatIcon />}
                  >
                    {chat.title}
                  </MenuItem>
                );
              })}
            </div>
          )}

          {/* Docs */}
          {filteredDocs.length === 0 ? null : (
            <>
              {filteredChats.length ? <Divider size="thinner" /> : null}
              <div className="flex flex-col gap-[2px] px-2">
                <div className={styles.groupLabel}>Docs</div>
                {filteredDocs.map(doc => {
                  return (
                    <MenuItem
                      onClick={() => handleAdd({ type: 'doc', id: doc.docId })}
                      key={doc.docId}
                      prefixIcon={<PageIcon />}
                    >
                      {doc.title}
                    </MenuItem>
                  );
                })}
              </div>
            </>
          )}

          {/* Files */}
          {filteredFiles.length === 0 ? null : (
            <>
              {filteredDocs.length || filteredChats.length ? (
                <Divider size="thinner" />
              ) : null}
              <div className="flex flex-col gap-[2px] px-2">
                <div className={styles.groupLabel}>Files</div>
                {filteredFiles.map(file => {
                  return (
                    <MenuItem
                      onClick={() =>
                        handleAdd({
                          type: 'file',
                          id: file.fileId,
                          mineType: file.mimeType,
                          name: file.fileName,
                          blobId: file.blobId,
                        })
                      }
                      key={file.fileId}
                      prefixIcon={
                        <FileIconRenderer
                          mimeType={file.mimeType}
                          blobId={file.blobId}
                          className="rounded-sm"
                        />
                      }
                    >
                      {file.fileName}
                    </MenuItem>
                  );
                })}
              </div>
            </>
          )}

          {/* Empty state */}
          {filteredDocs.length === 0 &&
          filteredFiles.length === 0 &&
          filteredChats.length === 0 ? (
            <div className="flex flex-col gap-[2px] px-2 py-2 text-center">
              <div className={styles.groupLabel}>No results</div>
            </div>
          ) : null}

          {/* Upload */}
          <div
            className={cn(
              'h-[46px] sticky bottom-0 px-2 mt-2',
              'border-t-[0.5px] bg-white',
              'flex items-center'
            )}
          >
            <input
              type="file"
              multiple
              className="opacity-0 absolute left-0 size-full cursor-pointer"
              ref={fileInputRef}
              onChange={e => {
                const files = e.target.files;
                if (!files) return;
                const newContexts: ChatContextFile[] = [];
                for (const file of files) {
                  newContexts.push({
                    type: 'file',
                    id: Math.random().toString(36).substring(2, 15),
                    blob: file,
                    mineType: file.type,
                    name: file.name,
                  });
                }
                handleAdd(newContexts);
                e.target.value = '';
                setOpen(false);
              }}
              onClick={e => {
                e.stopPropagation();
              }}
            />
            <MenuItem
              prefixIcon={<AttachmentIcon />}
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Add images & files
            </MenuItem>
          </div>
        </div>
      }
    >
      {children}
    </Menu>
  );
};

const ContextPreviewUI = ({
  contexts,
  handleRemove,
}: {
  contexts: ChatContext[];
  handleRemove: (id: string) => void;
}) => {
  return (
    <div className="w-full flex items-center gap-3 overflow-x-auto mb-2 pb-2 pt-4 -mt-4">
      {contexts.map(context => {
        switch (context.type) {
          case 'chat':
            return (
              <ChatContextPreview
                context={context}
                onRemove={() => handleRemove(context.id)}
              />
            );
          case 'doc':
            return (
              <DocContextPreview
                context={context}
                onRemove={() => handleRemove(context.id)}
              />
            );
          case 'file':
            return (
              <FileContextPreview
                context={context}
                onRemove={() => handleRemove(context.id)}
              />
            );
        }
      })}
    </div>
  );
};

const ContextCachePreview = () => {
  const { contexts, removeContexts, loadContexts } = useContextCache();

  useEffect(() => {
    loadContexts();
  }, [loadContexts]);

  const handleRemove = async (id: string) => {
    removeContexts([id]);
  };

  if (!contexts.length) return null;
  return <ContextPreviewUI contexts={contexts} handleRemove={handleRemove} />;
};

const ContextCloudPreview = ({
  store,
}: {
  store: StoreApi<ChatSessionState>;
}) => {
  const contextFiles = useStore(store, s => s.contextFiles);
  const contextChats = useStore(store, s => s.contextChats);
  const contextDocs = useStore(store, s => s.contextDocs);

  const contexts = useMemo(() => {
    return [
      ...contextFiles.map(file => ({ type: 'file', value: file })),
      ...contextChats.map(chat => ({ type: 'chat', value: chat })),
      ...contextDocs.map(doc => ({ type: 'doc', value: doc })),
    ]
      .sort((a, b) => {
        return a.value.createdAt - b.value.createdAt;
      })
      .map(({ type, value }) => {
        if (type === 'file') {
          const file = value as CopilotContextFile;
          return {
            type: 'file',
            id: value.id,
            blobId: file.blobId,
            mineType: file.mimeType,
            name: file.name,
          } satisfies ChatContextFile;
        }
        if (type === 'chat') {
          const chat = value as CopilotContextChatOrDoc;
          return {
            type: 'chat',
            id: chat.id,
          } satisfies ChatContextChat;
        }
        if (type === 'doc') {
          const doc = value as CopilotContextChatOrDoc;
          return {
            type: 'doc',
            id: doc.id,
          } satisfies ChatContextDoc;
        }
        return null;
      }) as ChatContext[];
  }, [contextChats, contextDocs, contextFiles]);

  const handleRemove = async (id: string) => {
    const context = contexts.find(c => c.id === id);
    if (context?.type === 'file') {
      return await store.getState().removeFileContext(context.id);
    }
    if (context?.type === 'chat') {
      return await store.getState().removeChatContext(context.id);
    }
    if (context?.type === 'doc') {
      return await store.getState().removeDocContext(context.id);
    }
  };

  if (!contexts.length) return null;
  return <ContextPreviewUI contexts={contexts} handleRemove={handleRemove} />;
};

export const ContextPreview = ({
  store,
}: {
  store?: StoreApi<ChatSessionState>;
}) => {
  return store ? (
    <ContextCloudPreview store={store} />
  ) : (
    <ContextCachePreview />
  );
};
