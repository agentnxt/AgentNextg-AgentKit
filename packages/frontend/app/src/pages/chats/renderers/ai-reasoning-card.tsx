import { Loading } from '@afk/component';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useEffect, useRef, useState } from 'react';

import { MarkdownText } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

import { GenericToolResult } from './generic-tool-result';
import { toolResult } from './tool.css';

interface AIReasoningCardProps {
  text: string;
  loading?: boolean;
  duration?: number; // Duration in seconds
  className?: string;
}

export function AIReasoningCard({
  text,
  loading = false,
  duration = 0,
  className,
}: AIReasoningCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Track elapsed time
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsCompleted(true);
    }
  }, [loading]);

  // Progressive text display during loading
  useEffect(() => {
    if (loading) {
      // Simulate progressive content generation
      const interval = setInterval(() => {
        setDisplayedText(prev => {
          const nextChar = text[prev.length];
          return nextChar ? prev + nextChar : prev;
        });
      }, 50); // Faster typing effect for progressive generation

      return () => clearInterval(interval);
    } else {
      // When loading stops, show full text
      setDisplayedText(text);
    }
  }, [text, loading]);

  // Auto-scroll to bottom during content generation
  useEffect(() => {
    if (loading && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedText, loading]);

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  const getStatusText = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">Thinking...</span>
          <span className="text-sm font-normal">{formatTime(elapsedTime)}</span>
        </div>
      );
    }
    if ((duration || elapsedTime) > 0) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">Thought for</span>
          <span className="text-sm font-normal">
            {formatTime(duration || elapsedTime)}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">Thoughts</span>
      </div>
    );
  };

  const content = (
    <div className="px-4 max-h-150 overflow-y-auto">
      <div ref={contentRef} className={cn('max-w-none my-2')}>
        <MarkdownText
          text={displayedText}
          loading={loading}
          className="prose prose-sm text-[13px]"
          style={{
            color: cssVarV2.text.secondary,
          }}
        />
      </div>
    </div>
  );

  return (
    <GenericToolResult
      icon={loading ? <Loading /> : null}
      title={getStatusText()}
      className={cn(toolResult, className)}
    >
      {content}
    </GenericToolResult>
  );
}
