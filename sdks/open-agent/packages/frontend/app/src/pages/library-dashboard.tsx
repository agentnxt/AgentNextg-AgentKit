import {
  Button,
  IconButton,
  Loading,
  Masonry,
  type MasonryGroup,
  type MasonryItem,
  Menu,
  MenuItem,
  toast,
} from '@afk/component';
import {
  DeleteIcon,
  FavoritedIcon,
  FavoriteIcon,
  MoreVerticalIcon,
  PageIcon,
} from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { FileIconRenderer } from '@/components/file-icon-renderer';
import { ChatIcon } from '@/icons/chat';
import { EmptyLibrary } from '@/icons/empty-library';
import { cn } from '@/lib/utils';
import { copilotClient } from '@/store/copilot/client';
import {
  useChatsMap,
  useDocsMap,
  useFilesMap,
  useLibraryStore,
} from '@/store/library';

import { AutoSidebarPadding } from './layout/auto-sidebar-padding';
import * as styles from './library-dashboard.css';

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Chats', value: 'chats' },
  { label: 'Documents', value: 'docs' },
  { label: 'Attachments', value: 'files' },
];

const groupDate = (items: any[], dateField = 'updatedAt') => {
  return items.reduce(
    (acc, item) => {
      const date = dayjs(item[dateField]);
      if (date.isSame(dayjs(), 'day')) {
        acc.today.push(item);
        return acc;
      }
      if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
        acc.yesterday.push(item);
        return acc;
      }
      if (date.isSame(dayjs(), 'week')) {
        acc.thisWeek.push(item);
        return acc;
      }
      if (date.isSame(dayjs(), 'month')) {
        acc.thisMonth.push(item);
        return acc;
      }
      acc.older.push(item);
      return acc;
    },
    {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    }
  );
};

const Empty = ({ active }: { active: 'chats' | 'docs' | 'files' | 'all' }) => {
  return (
    <div className="size-full flex flex-col justify-center items-center">
      <EmptyLibrary
        active={active}
        className="text-[97px]"
        style={{ color: cssVarV2.text.secondary }}
      />
      <span className="text-[15px] leading-[24px] color-black font-medium">
        There are no contents here
      </span>
      <span
        style={{
          color: cssVarV2.text.secondary,
        }}
        className="text-sm leading-[22px]"
      >
        You can generate content by creating new chats
      </span>

      <Link to="/chats" className="mt-4">
        <Button>New Chat</Button>
      </Link>
    </div>
  );
};

const DateGroupHeader: MasonryGroup['Component'] = ({ groupId, itemCount }) => {
  return (
    <div className={cn('bg-white', styles.dateGroupHeader)}>
      {groupId}
      <span className="mx-1">·</span>
      {itemCount}
    </div>
  );
};

export const FavoriteAction = ({
  collected,
  setToggleAsync,
  disabled,
}: {
  disabled?: boolean;
  collected: boolean;
  setToggleAsync: (toggle: boolean) => Promise<void>;
}) => {
  const [toggling, setToggling] = useState(false);

  const toggleCollect = useCallback(() => {
    setToggling(true);
    setToggleAsync(!collected).finally(() => {
      setToggling(false);
    });
  }, [collected, setToggleAsync]);

  return (
    <IconButton
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        toggleCollect();
      }}
      disabled={toggling || disabled}
    >
      {collected ? (
        <FavoritedIcon style={{ color: cssVarV2('button/primary') }} />
      ) : (
        <FavoriteIcon />
      )}
    </IconButton>
  );
};

const ChatListItem: MasonryItem['Component'] = ({ itemId }) => {
  const { toggleCollect, refresh } = useLibraryStore();
  const chatsMap = useChatsMap();
  const chat = chatsMap[itemId];
  const collected = chat?.metadata?.collected;
  const [deleting, setDeleting] = useState(false);

  const toggle = useCallback(async () => {
    await toggleCollect('chat', itemId);
  }, [itemId, toggleCollect]);

  const deleteSession = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await copilotClient.removeSession({
        sessionId: itemId,
      });
      toast(`${chat?.title ?? 'New Chat'} deleted`);
      refresh();
    } finally {
      setDeleting(false);
    }
  }, [chat?.title, deleting, itemId, refresh]);

  return (
    <Link to={`/chats/${itemId}`} className={deleting ? 'opacity-50' : ''}>
      <div className={styles.listItem}>
        <div className={styles.listItemIcon}>
          <ChatIcon />
        </div>
        <div className={styles.listItemTitle}>{chat?.title ?? 'New Chat'}</div>
        <div
          className="flex items-center gap-2"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <FavoriteAction
            collected={collected}
            setToggleAsync={toggle}
            disabled={deleting}
          />
          <Menu
            contentOptions={{
              align: 'end',
            }}
            items={
              <>
                <MenuItem
                  prefixIcon={<DeleteIcon />}
                  type="danger"
                  onClick={deleteSession}
                >
                  Delete Chat
                </MenuItem>
              </>
            }
          >
            <IconButton
              disabled={deleting}
              icon={<MoreVerticalIcon />}
              loading={deleting}
            />
          </Menu>
        </div>
      </div>
    </Link>
  );
};

const DocListItem: MasonryItem['Component'] = ({ itemId }) => {
  const { toggleCollect } = useLibraryStore();
  const docsMap = useDocsMap();
  const navigate = useNavigate();
  const doc = docsMap[itemId];

  const toggle = useCallback(async () => {
    await toggleCollect('doc', itemId);
  }, [itemId, toggleCollect]);

  const handleOpenDoc = useCallback(() => {
    navigate(`/library/${itemId}`);
  }, [itemId, navigate]);

  return (
    <div
      className={styles.listItem}
      onClick={handleOpenDoc}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.listItemIcon}>
        <PageIcon />
      </div>
      <div className={styles.listItemTitle}>{doc.title}</div>
      <div onClick={e => e.stopPropagation()}>
        <FavoriteAction
          collected={doc?.metadata?.collected}
          setToggleAsync={toggle}
        />
      </div>
    </div>
  );
};

const FileListItem: MasonryItem['Component'] = ({ itemId }) => {
  const { toggleCollect } = useLibraryStore();
  const filesMap = useFilesMap();
  const file = filesMap[itemId];

  const toggle = useCallback(async () => {
    await toggleCollect('file', itemId);
  }, [itemId, toggleCollect]);

  return (
    <div className={styles.listItem}>
      <div className={styles.listItemIcon}>
        <FileIconRenderer
          className="rounded-sm"
          mimeType={file.mimeType}
          blobId={file.blobId}
        />
      </div>
      <div className={styles.listItemTitle}>{file.fileName}</div>
      <div>
        <FavoriteAction
          collected={file?.metadata?.collected}
          setToggleAsync={toggle}
        />
      </div>
    </div>
  );
};

const withType = <T extends object>(items: T[], type: string) => {
  return items.map(item => ({ ...item, _type: type }));
};

const getComponentByType = (type: string) =>
  type === 'chats'
    ? ChatListItem
    : type === 'docs'
      ? DocListItem
      : FileListItem;

export const LibraryDashboard = () => {
  const { chats, docs, files, initialized } = useLibraryStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let type = searchParams.get('type') ?? 'all';
  if (!categories.some(c => c.value === type)) {
    type = 'all';
  }

  const masonryItems = useMemo(() => {
    if (type === 'all') {
      const itemsWithType = [
        ...withType(chats, 'chats'),
        ...withType(docs, 'docs'),
        ...withType(files, 'files'),
      ].sort((a, b) => {
        return (
          new Date((b as any).updatedAt ?? b.createdAt).getTime() -
          new Date((a as any).updatedAt ?? a.createdAt).getTime()
        );
      });
      return Object.entries<any>(groupDate(itemsWithType))
        .filter(([_, items]) => items.length > 0)
        .map(([key, items]) => ({
          id: key,
          height: 24,
          Component: DateGroupHeader,
          items: items.map((item: any) => {
            const type = item._type;
            return {
              id:
                type === 'chats'
                  ? item.sessionId
                  : type === 'docs'
                    ? item.docId
                    : item.fileId,
              height: 42,
              Component: getComponentByType(type),
              className: 'transition-transform duration-200',
            } satisfies MasonryItem;
          }),
        }));
    }

    const list = type === 'chats' ? chats : type === 'docs' ? docs : files;
    return Object.entries<any>(groupDate(list))
      .filter(([_, items]) => items.length > 0)
      .map(([key, items]) => ({
        id: key,
        height: 24,
        Component: DateGroupHeader,
        items: items.map((item: any) => ({
          id:
            type === 'chats'
              ? item.sessionId
              : type === 'docs'
                ? item.docId
                : item.fileId,
          height: 42,
          Component: getComponentByType(type),
          className: 'transition-transform duration-200',
        })),
      }));
  }, [chats, docs, files, type]);

  const isEmpty = masonryItems.length === 0;

  if (!initialized) {
    return (
      <div className="h-full flex-1 flex panel items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex-1 panel overflow-hidden h-full flex flex-col">
      <header className="h-15 border-b-[0.5px] px-4 flex items-center gap-4">
        <AutoSidebarPadding className="transition-all h-full flex items-center">
          <span className={styles.library}>Library</span>
        </AutoSidebarPadding>

        <ul className="flex items-center gap-2">
          {categories.map(c => (
            <li key={c.value}>
              <Button
                className={styles.btn}
                data-active={c.value === type}
                onClick={() => {
                  navigate(`/library?type=${c.value}`, { replace: true });
                }}
              >
                {c.label}
              </Button>
            </li>
          ))}
        </ul>
      </header>
      <main className="h-0 flex-1 pt-4">
        {isEmpty ? <Empty active={type as any} /> : ''}
        <Masonry
          items={masonryItems}
          virtualScroll
          columns={1}
          paddingX={12}
          gapY={4}
          groupHeaderGapWithItems={8}
          locateMode="transform"
        />
      </main>
    </div>
  );
};
