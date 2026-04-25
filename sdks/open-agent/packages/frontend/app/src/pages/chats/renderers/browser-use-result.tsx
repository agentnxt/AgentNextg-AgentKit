import { Loading } from '@afk/component';
import {
  EmbedWebIcon,
  EmptyIcon,
  SingleSelectCheckSolidIcon,
  WebIcon,
} from '@blocksuite/icons/rc';
import { useState } from 'react';

import { MarkdownText } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

import { GenericToolResult } from './generic-tool-result';
import { toolResult } from './tool.css';

const BROWSER_USE_TASK_STATUS = {
  CREATED: 'created',
  RUNNING: 'running',
  FINISHED: 'finished',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  FAILED: 'failed',
};

// Define icon constants
const completedIcon = <SingleSelectCheckSolidIcon fontSize={20} />;
const errorIcon = <EmptyIcon fontSize={20} color="#ED3F3F" />;
const loadingIcon = <Loading size={20} />;

interface BrowserUseResultProps {
  /** The browser-use tool result */
  result: {
    currentStatus: string;
    currentScreenshot: string | null;
    finalGif: string | null;
    finalMarkdown: string | null;
    stepsInfo: Array<{
      next_goal: string;
      url: string;
    }>;
  };
}

/**
 * Specialized UI component for displaying browser-use tool results.
 * Shows task status, screenshots/GIFs, and markdown content.
 */
export function BrowserUseResult({ result }: BrowserUseResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentImage = result.finalGif || result.currentScreenshot || null;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const {
    currentStatus,
    currentScreenshot,
    finalGif,
    finalMarkdown,
    stepsInfo,
  } = result;

  // Determine display image and status text
  let displayImage = currentImage;

  return (
    <GenericToolResult
      icon={<EmbedWebIcon />}
      title={
        currentStatus === BROWSER_USE_TASK_STATUS.FINISHED ||
        currentStatus === BROWSER_USE_TASK_STATUS.STOPPED ||
        currentStatus === BROWSER_USE_TASK_STATUS.FAILED ||
        currentStatus === BROWSER_USE_TASK_STATUS.PAUSED ? (
          <span className="text-sm text-gray-600">
            The browser task has been completed. Below are the steps and
            results.
          </span>
        ) : (
          <span className="text-sm text-gray-600">
            The browser task is running. Below are the steps and results.
          </span>
        )
      }
    >
      <div className="max-h-150 overflow-y-auto">
        {/* Preview Content */}
        {displayImage && (
          <div className="p-4 not-prose">
            <img
              src={displayImage}
              alt="Browser screenshot"
              className="w-full max-h-96 object-contain rounded-lg border"
            />
          </div>
        )}

        {/* Steps Info */}
        {stepsInfo && stepsInfo.length > 0 && (
          <div className="p-3 space-y-3">
            <div className="space-y-2">
              {stepsInfo.map((step, index) => {
                const isLastStep = index === stepsInfo.length - 1;
                // Determine icon type
                let iconElement;
                if (!isLastStep) {
                  // Not the last step, show completed icon
                  iconElement = completedIcon;
                } else {
                  // Last step, show different icons based on status
                  if (currentStatus === BROWSER_USE_TASK_STATUS.FINISHED) {
                    // Completed
                    iconElement = completedIcon;
                  } else if (
                    currentStatus === BROWSER_USE_TASK_STATUS.CREATED ||
                    currentStatus === BROWSER_USE_TASK_STATUS.RUNNING
                  ) {
                    // In progress, show loading animation
                    iconElement = loadingIcon;
                  } else if (
                    currentStatus === BROWSER_USE_TASK_STATUS.STOPPED ||
                    currentStatus === BROWSER_USE_TASK_STATUS.FAILED ||
                    currentStatus === BROWSER_USE_TASK_STATUS.PAUSED
                  ) {
                    // Error status
                    iconElement = errorIcon;
                  } else {
                    iconElement = errorIcon;
                  }
                }

                return (
                  <div key={index} className="p-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{iconElement}</div>
                      <div className="text-sm text-text-primary">
                        {step.next_goal}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Markdown Content */}
        {finalMarkdown && (
          <div className="p-8">
            <div className="text-sm">
              <MarkdownText
                text={finalMarkdown}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        )}

        {/* No content message */}
        {stepsInfo &&
          stepsInfo.length === 0 &&
          finalMarkdown === null &&
          displayImage === null && (
            <div className="p-3 text-sm text-gray-500 text-center">
              No detailed content available.
            </div>
          )}
      </div>
    </GenericToolResult>
  );
}

export function transformStep(
  middleResult: string
): BrowserUseResultProps['result'] | null {
  let parsedResult = null;
  try {
    parsedResult = JSON.parse(
      `[${middleResult.slice(0, middleResult.length - 1)}]`
    );
  } catch (err) {
    console.error('Failed to parse middleResult', err);
    return null;
  }

  const currentStatus = parsedResult[parsedResult.length - 1].currentStatus;

  const currentScreenshot =
    parsedResult[parsedResult.length - 1].currentScreenshot;
  // 合并所有步骤信息
  const stepsInfo = parsedResult.map((item: any) => item.step);

  return {
    currentStatus,
    currentScreenshot,
    finalGif: null,
    finalMarkdown: null,
    stepsInfo,
  };
}
