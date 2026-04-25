import { IconButton, observeResize, toast } from '@afk/component';
import {
  CopyIcon,
  ExpandCloseIcon,
  ExpandFullIcon,
} from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useEffect, useRef, useState } from 'react';

import { useHighlightedCode } from '../../lib/hooks/use-highlighted-code';

export const CodeBlock = ({
  children,
  language,
}: {
  children: React.ReactNode;
  language: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hitMaxHeight, setHitMaxHeight] = useState(false);
  const codeBlockRef = useRef<HTMLDivElement>(null);

  const html = useHighlightedCode(children as string, language);

  useEffect(() => {
    if (!codeBlockRef.current) return;
    return observeResize(codeBlockRef.current, () => {
      if (!codeBlockRef.current) return;
      const height = codeBlockRef.current.scrollHeight;
      setHitMaxHeight(height > 400);
    });
  }, []);

  return (
    <div className="custom-code-block w-full rounded-xl border not-prose overflow-hidden">
      <header
        className="flex items-center justify-between border-b-[0.5px] h-12 px-4"
        style={{ backgroundColor: cssVarV2('toast/overlay/secondary') }}
      >
        <div className="text-sm text-text-secondary ">{language}</div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={<CopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(children as string);
              toast('Copied to clipboard');
            }}
          />
          {hitMaxHeight ? (
            <IconButton
              icon={expanded ? <ExpandCloseIcon /> : <ExpandFullIcon />}
              onClick={() => setExpanded(!expanded)}
            />
          ) : null}
        </div>
      </header>
      <div
        ref={codeBlockRef}
        className="p-4 text-[13px] overflow-auto bg-white"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          maxHeight: expanded ? 'none' : '400px',
        }}
      />
    </div>
  );
};
