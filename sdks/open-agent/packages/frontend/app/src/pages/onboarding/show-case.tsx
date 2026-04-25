import { Modal } from '@afk/component';
import { PlayFillIcon } from '@blocksuite/icons/rc';
import { LayoutGroup, motion } from 'framer-motion';
import { useState } from 'react';
import useSWR from 'swr';

import { ChatPlayback } from '@/components/chat/chat-playback';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/store/copilot/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const playbacks = [
  {
    id: '1',
    url: '/playbacks/example-playback.json',
    title:
      'Discover the Art of Meaningful Conversations: Tips and Tricks for Creating Engaging and Memorable Chat Experiences with Friends!',
  },
  {
    id: '2',
    url: '/playbacks/example-playback.json',
    title:
      'Discover the Art of Meaningful Conversations: Tips and Tricks for Creating Engaging and Memorable Chat Experiences with Friends!',
  },
  {
    id: '3',
    url: '/playbacks/example-playback.json',
    title:
      'Discover the Art of Meaningful Conversations: Tips and Tricks for Creating Engaging and Memorable Chat Experiences with Friends!',
  },
  {
    id: '4',
    url: '/playbacks/example-playback.json',
    title:
      'Discover the Art of Meaningful Conversations: Tips and Tricks for Creating Engaging and Memorable Chat Experiences with Friends!',
  },
  {
    id: '5',
    url: '/playbacks/example-playback.json',
    title:
      'Discover the Art of Meaningful Conversations: Tips and Tricks for Creating Engaging and Memorable Chat Experiences with Friends!',
  },
  {
    id: '6',
    url: '/playbacks/example-playback.json',
    title:
      'Discover the Art of Meaningful Conversations: Tips and Tricks for Creating Engaging and Memorable Chat Experiences with Friends!',
  },
];

const ExamplePlayback = ({ url }: { url: string }) => {
  const { data } = useSWR<ChatMessage[]>(url, fetcher, {
    suspense: true,
  });

  if (!data) return null;
  return <ChatPlayback rawMessages={data} />;
};

export const ShowCase = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const show = (id: string) => {
    setActiveId(id);
  };

  const hide = () => {
    setActiveId(null);
  };

  return (
    <div className="max-w-[860px] px-4 grid grid-cols-3 gap-4">
      {playbacks.map(playback => (
        <LayoutGroup key={playback.id}>
          <div className="playback-item flex flex-col gap-2 p-1">
            <div className="relative w-full h-[158px] rounded-lg overflow-hidden group">
              {/* Thumbnail */}
              {activeId === playback.id ? null : (
                <motion.div
                  layout
                  layoutId={`playback-thumb-${playback.id}`}
                  className="playback-thumb size-full rounded-lg bg-gray-200"
                ></motion.div>
              )}

              {/* Play button */}
              <div
                className={cn(
                  'absolute size-full left-0 top-0',
                  'rounded-lg flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:bg-black/20'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center',
                    'size-11 rounded-full cursor-pointer',
                    'transition-all',
                    'bg-white/30 hover:bg-white/50'
                  )}
                  onClick={() => show(playback.id)}
                >
                  <PlayFillIcon className="text-2xl text-white translate-x-[2px]" />
                </div>
              </div>
            </div>
            <div className="text-[15px] text-text-primary truncate">
              {playback.title}
            </div>
          </div>
          <Modal
            open={activeId === playback.id}
            onOpenChange={value => !value && hide()}
            contentOptions={{
              style: {
                maxWidth: '1080px',
                maxHeight: '860px',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <header className="truncate flex items-center justify-between">
              {playback.title}
            </header>
            <main className="rounded-lg h-0 flex-1">
              <ExamplePlayback url={playback.url} />
            </main>
          </Modal>
        </LayoutGroup>
      ))}
    </div>
  );
};
