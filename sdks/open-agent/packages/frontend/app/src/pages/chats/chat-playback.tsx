import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { type StoreApi, useStore } from 'zustand';

import { ChatPlayback } from '@/components/chat/chat-playback';
import { DocPanelById } from '@/components/doc-panel/doc-panel';
import { OpenDocProvider } from '@/contexts/doc-panel-context';
import { useRefCounted } from '@/lib/hooks/use-ref-counted';
import { copilotClient } from '@/store/copilot/client';
import { chatSessionsStore } from '@/store/copilot/sessions-instance';
import type { ChatSessionState } from '@/store/copilot/types';

const PlaybackHeader = ({ title }: { title: string }) => {
  return (
    <div className="h-15 border-b-[0.5px] px-4 flex items-center justify-between gap-4">
      <Link to="/">
        <img src="/logo.svg" alt="OpenAgent" className="size-6" />
      </Link>
      <div className="text-sm font-medium text-text-primary truncate flex-1">
        {title}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button className="bg-black text-white px-4 py-1 h-8 rounded-md text-sm font-medium cursor-pointer">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------- Banner ---------------------------- */
const Banner = ({
  children,
  position,
}: {
  children: ReactNode;
  position: 'top' | 'bottom';
}) => {
  const base =
    'absolute left-1/2 -translate-x-1/2 w-[500px] bg-white shadow-lg border rounded-xl flex items-center justify-between gap-4 pl-4 pr-2 h-14';
  const posClass = position === 'top' ? 'top-20 rounded-full' : 'bottom-6';
  return <div className={`${base} ${posClass}`}>{children}</div>;
};

const CountdownOverlay = ({
  onStart,
  countdown,
}: {
  onStart: () => void;
  countdown: number;
}) => {
  return (
    <div className="absolute inset-0 flex z-5">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white h-1/2" />
      <div className="absolute w-full h-1/2 bottom-0 bg-white" />
      <div className="relative flex flex-col items-center justify-center self-end w-full h-[calc(100%-160px)] text-gray-500">
        <div className="text-sm w-[320px] text-center gap-4 flex flex-col">
          <span>
            You are viewing a complete OpenAgent task. Playback will begin
            automatically in
            <span className="font-bold text-gray-600 ml-1">
              {countdown} seconds
            </span>
          </span>

          <button
            className="bg-black text-white px-6 rounded-md text-sm h-10 font-medium cursor-pointer hover:bg-black self-center"
            onClick={onStart}
          >
            Start playback
          </button>
        </div>
      </div>
    </div>
  );
};

const COUNT_DOWN_TIME = 5;

const ChatPlaybackSession = ({
  store,
  className = '',
  headerContent,
  footerContent,
  showDocumentContext = false,
  onPlaybackStart,
  onPlaybackProgress,
  onPlaybackFinish,
  skipPlayback,
}: {
  store: StoreApi<ChatSessionState>;
  className?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  showDocumentContext?: boolean;
  onPlaybackStart?: () => void;
  onPlaybackProgress?: (current: number, total: number) => void;
  onPlaybackFinish?: () => void;
  skipPlayback?: boolean;
}) => {
  const rawMessages = useStore(store, s => s.rawMessages);
  const mergedMessages = useStore(store, s => s.messages);

  return (
    <ChatPlayback
      rawMessages={rawMessages}
      messages={mergedMessages}
      className={className}
      headerContent={headerContent}
      footerContent={footerContent}
      showDocumentContext={showDocumentContext}
      onStart={onPlaybackStart}
      onProgress={onPlaybackProgress}
      onFinish={onPlaybackFinish}
      skip={skipPlayback}
    />
  );
};

/**
 * Playback page renders chat messages one-by-one in read-only mode.
 */
export const ChatPlaybackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------- Document panel states ---------------- */
  const [docId, setDocId] = useState<string>();

  const openDoc = (docId: string) => {
    setDocId(docId);
  };

  const closeDoc = () => {
    setDocId(undefined);
  };

  // Track playback status for bottom pane
  const [_progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [finished, setFinished] = useState(false);
  const [version, setVersion] = useState(0); // to force remount for replay
  const [skipped, setSkipped] = useState(false);

  // Countdown overlay control (only shown on first playback)
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState<number>(COUNT_DOWN_TIME);

  // Kick-off countdown once on initial mount
  useEffect(() => {
    if (!showCountdown) return;

    // Start from defined countdown value and tick every second
    const timer = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setShowCountdown(false); // countdown finished – start playback
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showCountdown]);

  // Acquire shared store (read-only power)
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

  // If no id -> redirect back
  useEffect(() => {
    if (!id) navigate('/chats');
  }, [id, navigate]);

  const handleStart = useCallback(() => {
    setFinished(false);
    setProgress(null);
  }, []);

  const handleProgress = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  const handleFinish = useCallback(() => {
    setFinished(true);
  }, []);

  const replay = useCallback(() => {
    setSkipped(false);
    setVersion(v => v + 1);
  }, []);

  const skipToEnd = useCallback(() => {
    setSkipped(true);
  }, []);

  return (
    <OpenDocProvider value={{ openDoc, closeDoc }}>
      <div className="overflow-hidden h-full flex gap-2">
        <div className="flex-1 bg-white border rounded-[8px]  overflow-auto h-full">
          {id && sessionStore ? (
            <ChatPlaybackSession
              key={version}
              store={sessionStore}
              className="flex-1"
              headerContent={
                <PlaybackHeader
                  title={sessionStore.getState().meta?.title ?? 'New Chat'}
                />
              }
              onPlaybackStart={handleStart}
              onPlaybackProgress={handleProgress}
              onPlaybackFinish={handleFinish}
              skipPlayback={skipped || showCountdown}
            />
          ) : null}
        </div>
        {docId && (
          <div className="flex-1 bg-white border rounded-[8px] overflow-hidden h-full">
            <DocPanelById
              docId={docId}
              onOpenChat={() => {}}
              onClose={closeDoc}
            />
          </div>
        )}

        {/* Countdown overlay */}
        {showCountdown && (
          <CountdownOverlay
            onStart={() => setShowCountdown(false)}
            countdown={countdown}
          />
        )}

        {!showCountdown && !finished && !skipped && (
          <Banner position="bottom">
            <span className="font-medium flex items-center gap-2">
              <img src="/logo.svg" alt="OpenAgent" className="size-6" />
              OpenAgent is replaying task...
            </span>
            <button
              className="bg-black text-white px-4 py-1 rounded-md text-sm h-10 font-medium cursor-pointer"
              onClick={skipToEnd}
            >
              Skip to results
            </button>
          </Banner>
        )}

        {(finished || skipped) && !showCountdown && (
          <Banner position="bottom">
            <span className="font-medium flex items-center gap-2">
              <img src="/logo.svg" alt="OpenAgent" className="size-6" />
              OpenAgent replay completed
            </span>
            <button
              className="bg-black text-white px-4 py-1 rounded-md text-sm h-10 font-medium cursor-pointer"
              onClick={replay}
            >
              Watch again
            </button>
          </Banner>
        )}
      </div>
    </OpenDocProvider>
  );
};
