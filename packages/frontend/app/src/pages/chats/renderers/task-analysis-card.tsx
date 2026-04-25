import { ThinkingIcon } from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useRef } from 'react';

import { MarkdownText } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

import { GenericToolResult } from './generic-tool-result';
import { toolResult } from './tool.css';

interface TaskAnalysisCardProps {
  reasoning: string;
  suggestedApproach: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedSteps: number;
  className?: string;
}

export function TaskAnalysisCard({
  reasoning,
  suggestedApproach,
  complexity,
  estimatedSteps,
  className,
}: TaskAnalysisCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const content = (
    <div className="px-4 max-h-150 overflow-y-auto">
      <div ref={contentRef} className={cn('max-w-none my-2')}>
        <MarkdownText
          text={reasoning + '\n\n' + suggestedApproach}
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
      icon={<ThinkingIcon />}
      title={<span className="text-sm font-medium">Task Analysis</span>}
      className={cn(toolResult, className)}
    >
      {content}
    </GenericToolResult>
  );
}
