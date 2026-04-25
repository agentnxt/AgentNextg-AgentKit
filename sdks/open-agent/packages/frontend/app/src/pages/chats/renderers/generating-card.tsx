import { useEffect, useRef } from 'react';

import { MarkdownText } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

import * as styles from './generating-card.css';
import { toolResult } from './tool.css';

export const GeneratingCard = ({
  title,
  icon,
  content,
}: {
  title?: string;
  icon?: React.ReactNode;
  content?: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [content]);

  return (
    <div className={cn(toolResult, 'p-4 rounded-xl border')}>
      <header className="w-full truncate flex items-center gap-2">
        {icon ? (
          <div className="size-5 shrink-0 flex items-center justify-center text-xl">
            {icon}
          </div>
        ) : null}
        {title ? (
          <div className="text-sm font-medium w-0 flex-1 truncate">{title}</div>
        ) : null}
      </header>
      {content ? (
        <div className={styles.contentMaskLayer}>
          <div
            className={cn(
              'w-full h-full flex flex-col overflow-hidden max-h-20 mt-4 text-xs'
            )}
            ref={contentRef}
          >
            <div className="leading-5 not-prose">
              <MarkdownText
                text={content}
                loading={true}
                className="prose-sm"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
