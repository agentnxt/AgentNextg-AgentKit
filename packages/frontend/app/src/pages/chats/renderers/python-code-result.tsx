import type { StreamObject } from '@afk/graphql';

import { FilePythonIcon } from '@/icons/file-python';
import { useHighlightedCode } from '@/lib/hooks/use-highlighted-code';
import { cn } from '@/lib/utils';

import { GenericToolResult } from './generic-tool-result';

export const PythonCodeResult = ({
  result,
}: {
  result: StreamObject['result'];
}) => {
  const code = result as unknown as string;

  const highlightedHtml = useHighlightedCode(code, 'python');

  if (!result || !code) return null;

  return (
    <GenericToolResult title={'Code generated'} icon={<FilePythonIcon />}>
      <div
        className={cn('not-prose max-h-150 overflow-y-auto px-10 py-4 text-xs')}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </GenericToolResult>
  );
};
