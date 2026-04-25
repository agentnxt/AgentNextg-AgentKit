import { Divider, IconButton, Modal, RowInput } from '@afk/component';
import {
  AllDocsIcon,
  ArrowUpBigIcon,
  CloseIcon,
  EditIcon,
  PageIcon,
  SearchIcon,
} from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import dayjs from 'dayjs';
import { startTransition, useEffect, useRef, useState } from 'react';
import { type NavigateFunction, useNavigate } from 'react-router-dom';

import { FileIconRenderer } from '@/components/file-icon-renderer';
import { ChatIcon } from '@/icons/chat';
import { cn } from '@/lib/utils';
import {
  type Chat,
  type Doc,
  type File,
  useLibraryStore,
} from '@/store/library';

import * as styles from './cmdk.css';

export const Cmdk = ({
  className,
  alwaysShowActions = false,
}: {
  className?: string;
  /**
   * whether to show all actions when search is empty
   */
  alwaysShowActions?: boolean;
}) => {
  // dialog state
  const [open, setOpen] = useState(false);

  // search state
  const [search, setSearch] = useState('');

  // refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // library data
  const { docs, files, chats } = useLibraryStore();

  const [filteredDocs, setFilteredDocs] = useState<Doc[]>(docs);
  const [filteredFiles, setFilteredFiles] = useState<File[]>(files);
  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats);

  /* ---------- palette items & grouping ---------- */
  type PaletteItem = {
    key: string;
    label: string;
    icon: React.ReactElement;
    action: (input: string) => void;
    timestamp: number;
    /** whether the palette should close after this item executes */
    closeAfterExecute?: boolean;
  };

  /* ---------- actions factory ---------- */
  type Action = {
    /** display name */
    name: string;
    /** keywords used for default filter */
    keywords: string[];
    /**
     * execute with the current user input
     * @param input current search string
     */
    execute: (input: string) => void;
    /** icon rendered in the list */
    icon: React.ReactElement;
    /** custom filter logic, return true to show in palette */
    filter: (input: string) => boolean;
    /** bigger value means higher priority */
    priority?: number;
    /** whether to close palette after trigger */
    closeAfterExecute?: boolean;
  };

  const navigate = useNavigate();

  const paletteItems: PaletteItem[] = [
    ...filteredChats.map(chat => ({
      key: chat.sessionId,
      label: chat.title,
      icon: <ChatIcon />,
      action: () => handleNavigateChat(chat.sessionId),
      timestamp: new Date((chat as any).updatedAt ?? chat.createdAt).getTime(),
    })),
    ...filteredDocs.map(doc => ({
      key: doc.docId,
      label: doc.title,
      icon: <PageIcon />,
      action: () => handleNavigateDoc(doc.docId),
      timestamp: new Date((doc as any).updatedAt ?? doc.createdAt).getTime(),
    })),
    ...filteredFiles.map(file => ({
      key: file.fileId,
      label: file.fileName,
      icon: (
        <FileIconRenderer
          mimeType={file.mimeType}
          blobId={file.blobId}
          className="size-6 rounded-md text-2xl"
        />
      ),
      action: () => handleNavigateFile(file.fileId),
      timestamp: new Date((file as any).updatedAt ?? file.createdAt).getTime(),
    })),
  ].sort((a, b) => b.timestamp - a.timestamp) as PaletteItem[];

  const createActions = (nav: NavigateFunction): Action[] => [
    {
      name: `Start a new chat with: "${search}"`,
      keywords: [''],
      execute: (input: string) => {
        nav(`/chats/?msg=${input}`);
      },
      icon: <ArrowUpBigIcon />,
      priority: 10,
      closeAfterExecute: true,
      filter: () => {
        return paletteItems.length === 0 && search.length > 0;
      },
    },
    {
      name: 'New Chat',
      keywords: ['chat', 'new', 'conversation'],
      execute: () => nav('/chats'),
      icon: <EditIcon />,
      priority: 10,
      closeAfterExecute: true,
      filter: input => {
        const lower = input.toLowerCase();
        if (!lower) return false;
        return (
          'new chat'.includes(lower) ||
          ['chat', 'new', 'conversation'].some(k => k.includes(lower))
        );
      },
    },
    {
      name: 'Open Library',
      keywords: ['library', 'docs', 'files', 'documents'],
      execute: () => nav('/library'),
      icon: <AllDocsIcon />,
      priority: 8,
      closeAfterExecute: true,
      filter: input => {
        const lower = input.toLowerCase();
        if (!lower) return false;
        return (
          'open library'.includes(lower) ||
          ['library', 'docs', 'files', 'documents'].some(k => k.includes(lower))
        );
      },
    },
  ];

  const predefinedActions: Action[] = createActions(navigate);

  /* ---------- action filtering ---------- */
  const lowerSearch = search.toLowerCase();
  const showAllActions = alwaysShowActions && lowerSearch === '';

  const actionItems: PaletteItem[] = predefinedActions
    .filter(a => showAllActions || a.filter(lowerSearch))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .map(a => ({
      key: `action-${a.name}`,
      label: a.name,
      icon: a.icon,
      action: () => a.execute(search),
      timestamp: Number.MAX_SAFE_INTEGER, // ensure sort position irrelevant
      closeAfterExecute: a.closeAfterExecute,
    }));

  const finalItems: PaletteItem[] = [...actionItems, ...paletteItems];

  // group by date
  const groups = (() => {
    const now = dayjs();
    const res: Record<string, PaletteItem[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'This Month': [],
      Older: [],
    };
    for (const item of paletteItems) {
      const d = dayjs(item.timestamp);
      if (d.isSame(now, 'day')) {
        res['Today'].push(item);
      } else if (d.isSame(now.subtract(1, 'day'), 'day')) {
        res['Yesterday'].push(item);
      } else if (d.isSame(now, 'week')) {
        res['This Week'].push(item);
      } else if (d.isSame(now, 'month')) {
        res['This Month'].push(item);
      } else {
        res['Older'].push(item);
      }
    }
    return res;
  })();

  // ---------- keyboard navigation ----------
  const [activeIndex, setActiveIndex] = useState(0);

  // reset active index when list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search, finalItems.length]);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // ensure refs array length
  itemRefs.current = [];

  // scroll into view on active change
  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // focus search input when dialog opens
  useEffect(() => {
    if (open) {
      // slight delay to ensure input mounted
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearch('');
    }
  }, [open]);

  // filter logic with startTransition (same as ContextSelectorMenu)
  useEffect(() => {
    startTransition(() => {
      const lower = search.toLowerCase();
      setFilteredDocs(
        docs.filter(doc => doc.title.toLowerCase().includes(lower))
      );
      setFilteredFiles(
        files.filter(file => file.fileName.toLowerCase().includes(lower))
      );
      setFilteredChats(
        chats.filter(chat =>
          chat.title ? chat.title.toLowerCase().includes(lower) : false
        )
      );
    });
  }, [search, docs, files, chats]);

  // global shortcut cmd + k
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleNavigateChat = (id: string) => {
    navigate(`/chats/${id}`);
    setOpen(false);
  };
  const handleNavigateDoc = (id: string) => {
    navigate(`/library/${id}`);
    setOpen(false);
  };
  const handleNavigateFile = (id: string) => {
    navigate(`/library/${id}`);
    setOpen(false);
  };

  // ================= render =================
  return (
    <>
      {/* trigger button */}
      <div
        role="button"
        onClick={() => setOpen(true)}
        className={cn(
          'h-[34px] rounded-lg bg-white border flex items-center px-2 gap-3 cursor-pointer select-none',
          className
        )}
        style={{ boxShadow: `0px 1px 5px rgba(0,0,0,0.05)` }}
      >
        <div className="size-5 items-center flex justify-center">
          <SearchIcon className="text-xl text-icon-primary" />
        </div>
        <div
          className="text-sm truncate w-0 flex-1 flex items-center"
          style={{ color: cssVarV2.text.secondary }}
        >
          Search ⌘K
        </div>
      </div>

      {/* dialog */}
      <Modal
        open={open}
        onOpenChange={setOpen}
        width={400}
        persistent={false}
        withoutCloseButton
        overlayOptions={{
          style: {
            backgroundColor: 'rgba(0,0,0,0.01)',
            // backgroundImage: 'radial-gradient(transparent 1px, #fff 1px)',
            // backdropFilter: 'brightness(0.9) saturate(0.8) blur(1px)',
            // backgroundSize: '3px 3px',
          },
        }}
        contentWrapperStyle={{
          alignItems: 'flex-start',
        }}
        contentOptions={{
          style: {
            padding: 0,
            width: `calc(100% - 48px)`,
            maxHeight: 420,
            maxWidth: 720,
            marginTop: `min(200px, 20vh)`,
            minHeight: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            boxShadow: `0px 5px 140px 0px rgba(0, 0, 0, 0.15), 0px 2px 6px 0px rgba(0, 0, 0, 0.05)`,
          },
        }}
      >
        <div className="h-0 flex-1 flex flex-col justify-start" style={{}}>
          {/* search bar */}
          <div className="flex items-center gap-2 pr-6 border-b-[0.5px]">
            <RowInput
              ref={searchInputRef}
              className="pl-6 w-0 flex-1 h-18 focus:outline-none text-xl"
              placeholder="Search chats..."
              value={search}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex(prev =>
                    Math.min(prev + 1, finalItems.length - 1)
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex(prev => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  finalItems[activeIndex]?.action(search);
                  setOpen(false);
                }
              }}
              onChange={setSearch}
            />
            <IconButton size="24" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {actionItems.length > 0 && (
              <div className="flex flex-col gap-[2px] px-2 mb-4">
                <div className={styles.groupLabel}>Actions</div>
                {actionItems.map(item => {
                  const globalIndex = finalItems.findIndex(
                    it => it.key === item.key
                  );
                  const active = globalIndex === activeIndex;
                  return (
                    <div
                      key={item.key}
                      ref={el => {
                        itemRefs.current[globalIndex] = el;
                      }}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                      onClick={() => {
                        item.action(search);
                        if ((item as any).closeAfterExecute) {
                          setOpen(false);
                        }
                      }}
                      data-active={active}
                      className={cn(
                        'flex items-center gap-2 px-2 h-8 rounded-md cursor-pointer',
                        styles.item
                      )}
                    >
                      <div
                        className="size-6 flex items-center justify-center text-2xl"
                        style={{ color: cssVarV2.icon.primary }}
                      >
                        {item.icon}
                      </div>
                      <span className="text-sm truncate flex-1">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {(
              [
                'Today',
                'Yesterday',
                'This Week',
                'This Month',
                'Older',
              ] as const
            ).map(groupLabel => {
              const items = groups[groupLabel];
              if (!items || items.length === 0) return null;
              const firstGroup = Object.keys(groups).find(
                key => groups[key].length > 0
              );
              return (
                <div
                  key={groupLabel}
                  className="flex flex-col gap-[2px] px-2 mb-4"
                >
                  {/* Divider between groups (skip first) */}
                  {groupLabel !== firstGroup ? (
                    <Divider size="thinner" />
                  ) : null}
                  <div className={styles.groupLabel}>{groupLabel}</div>
                  {items.map(item => {
                    const globalIndex = finalItems.findIndex(
                      it => it.key === item.key
                    );
                    const active = globalIndex === activeIndex;
                    return (
                      <div
                        key={item.key}
                        ref={el => {
                          itemRefs.current[globalIndex] = el;
                        }}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        onClick={() => item.action(search)}
                        data-active={active}
                        className={cn(
                          'flex items-center gap-2 px-2 h-8 rounded-md cursor-pointer',
                          styles.item
                        )}
                      >
                        <div
                          className="size-6 flex items-center justify-center text-2xl"
                          style={{ color: cssVarV2.icon.primary }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-sm truncate flex-1">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {finalItems.length === 0 ? (
              <div className="flex flex-col gap-[2px] px-2 py-8 text-center">
                <div className={styles.groupLabel}>No results</div>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
};
