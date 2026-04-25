import { Logger } from '@nestjs/common';
import { z } from 'zod';

import { Config } from '../../../base';
import { StreamObjectToolResult } from '../providers';
import { toolError } from './error';
import { createTool } from './utils';

const logger = new Logger('BrowserUseTool');

const BROWSER_USE_API_URL = 'https://api.browser-use.com/api/v1';
const BROWSER_USE_TASK_STATUS = {
  CREATED: 'created',
  RUNNING: 'running',
  FINISHED: 'finished',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  FAILED: 'failed',
};

interface BrowserUseTaskResponse {
  id: string;
}

interface BrowserUseScreenshotsResponse {
  screenshots: string[];
}

interface BrowserUseGifResponse {
  gif: string;
}

interface BrowserUseOutputFileResponse {
  download_url: string;
}

interface BrowserUseStepsResponse {
  id: string;
  task: string;
  output: string | null;
  status: (typeof BROWSER_USE_TASK_STATUS)[keyof typeof BROWSER_USE_TASK_STATUS];
  created_at: string;
  steps: Array<{
    id: string;
    step: number;
    evaluation_previous_goal: string;
    next_goal: string;
    url: string;
    live_url: string | null;
    finished_at: string | null;
    browser_data: {
      cookies: Array<{
        name: string;
        value: string;
        domain: string;
        path: string;
        expires: number | null;
        httpOnly: boolean;
        secure: boolean;
        sameSite: string;
      }>;
    } | null;
  }>;
  finished_at: string | null;
  browser_data: {
    cookies: Array<{
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number | null;
      httpOnly: boolean;
      secure: boolean;
      sameSite: string;
    }>;
  } | null;
  user_uploaded_files: string[] | null;
  output_files: string[] | null;
  public_share_url: string | null;
}

/**
 * Downloads and parses markdown content from a URL
 */
async function downloadMarkdownContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      logger.warn(
        `Failed to download markdown from ${url}: ${response.statusText}`
      );
      return null;
    }

    const content = await response.text();
    return content;
  } catch (error: any) {
    logger.error(`Error downloading markdown from ${url}:`, error);
    return null;
  }
}

/**
 * A copilot tool that uses browser-use API to accomplish web tasks.
 * It creates a task, polls for status, and returns screenshots and markdown results.
 */
export const createBrowserUseTool = (
  toolStream: WritableStream<StreamObjectToolResult>,
  config: Config
) => {
  return createTool(
    { toolName: 'browser_use' },
    {
      description:
        'Use the browser to accomplish a task, should try web search tools before using this.',
      inputSchema: z.object({
        task_description: z.string().describe('The task to accomplish'),
      }),
      execute: async ({ task_description }, { toolCallId }) => {
        try {
          // Step 1: Create the task
          const { key } = config.copilot.browserUse;
          const taskResponse = await fetch(`${BROWSER_USE_API_URL}/run-task`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              task: task_description + '\n\nSave the final result as result.md',
              save_browser_data: true,
              llm_model: 'claude-sonnet-4-20250514',
              use_adblock: true,
              use_proxy: true,
              proxy_country_code: 'us',
              highlight_elements: true,
              browser_viewport_width: 1280,
              browser_viewport_height: 960,
              enable_public_share: true,
            }),
          });

          if (!taskResponse.ok) {
            throw new Error(
              `Failed to create task: ${taskResponse.statusText}`
            );
          }

          const taskData: BrowserUseTaskResponse =
            (await taskResponse.json()) as BrowserUseTaskResponse;
          const taskId = taskData.id;

          // Step 2: Poll for status and screenshots
          let currentStatus: string = BROWSER_USE_TASK_STATUS.CREATED;
          let currentScreenshot: string | null = null;
          let finalGif: string | null = null;
          let finalMarkdown: string | null = null;
          let stepsInfo: {
            next_goal: string;
            url: string;
          }[] = [];
          let internalScreenshots: string[] = [];
          const writer = toolStream.getWriter();

          while (
            currentStatus === BROWSER_USE_TASK_STATUS.CREATED ||
            currentStatus === BROWSER_USE_TASK_STATUS.RUNNING
          ) {
            // Wait 3 seconds before polling
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Get status
            const statusResponse = await fetch(
              `${BROWSER_USE_API_URL}/task/${taskId}/status`,
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                },
              }
            );

            if (!statusResponse.ok) {
              throw new Error(
                `Failed to get task status: ${statusResponse.statusText}`
              );
            }

            const statusData: string = await statusResponse.text();
            currentStatus = statusData.replace(/"/g, ''); // Remove quotes

            if (
              currentStatus === BROWSER_USE_TASK_STATUS.STOPPED ||
              currentStatus === BROWSER_USE_TASK_STATUS.FAILED ||
              currentStatus === BROWSER_USE_TASK_STATUS.PAUSED
            ) {
              return toolError(
                'Browser Use Task Failed',
                `Task ${currentStatus}`
              );
            }

            if (
              currentStatus === BROWSER_USE_TASK_STATUS.CREATED ||
              currentStatus === BROWSER_USE_TASK_STATUS.RUNNING
            ) {
              const stepsResponse = await fetch(
                `${BROWSER_USE_API_URL}/task/${taskId}`,
                {
                  headers: {
                    Authorization: `Bearer ${key}`,
                  },
                }
              );

              if (stepsResponse.ok) {
                const stepsData: BrowserUseStepsResponse =
                  (await stepsResponse.json()) as BrowserUseStepsResponse;
                const screenshotsResponse = await fetch(
                  `${BROWSER_USE_API_URL}/task/${taskId}/screenshots`,
                  {
                    headers: {
                      Authorization: `Bearer ${key}`,
                    },
                  }
                );

                if (screenshotsResponse.ok) {
                  const screenshotsData: BrowserUseScreenshotsResponse =
                    (await screenshotsResponse.json()) as BrowserUseScreenshotsResponse;
                  // Only update internal array if the returned screenshotsData has more elements than the internal array
                  if (
                    screenshotsData.screenshots &&
                    screenshotsData.screenshots.length > 0 &&
                    screenshotsData.screenshots.length >
                      internalScreenshots.length
                  ) {
                    internalScreenshots = [...screenshotsData.screenshots];

                    // Return the URL of the last screenshot in the array

                    currentScreenshot =
                      internalScreenshots[internalScreenshots.length - 1];
                  }
                }

                if (stepsInfo.length < stepsData.steps.length) {
                  const temp = stepsData.steps.slice(
                    stepsInfo.length,
                    stepsInfo.length + 1
                  );
                  for (const step of temp) {
                    const data = {
                      next_goal: step.next_goal,
                      url: step.url,
                    };
                    stepsInfo.push(data);

                    const deltaData = {
                      step: data,
                      currentStatus,
                      currentScreenshot,
                    };
                    logger.log(JSON.stringify(deltaData));
                    await writer.write({
                      type: 'tool-incomplete-result',
                      toolCallId,
                      data: {
                        type: 'text-delta',
                        textDelta: `${JSON.stringify(deltaData)},`,
                      },
                    });
                  }
                }
              }
            }

            if (currentStatus === BROWSER_USE_TASK_STATUS.FINISHED) {
              // Get final results
              const gifResponse = await fetch(
                `${BROWSER_USE_API_URL}/task/${taskId}/gif`,
                {
                  headers: {
                    Authorization: `Bearer ${key}`,
                  },
                }
              );

              if (gifResponse.ok) {
                const gifData: BrowserUseGifResponse =
                  (await gifResponse.json()) as BrowserUseGifResponse;
                finalGif = gifData.gif;
              }

              const outputFileResponse = await fetch(
                `${BROWSER_USE_API_URL}/task/${taskId}/output-file/result.md`,
                {
                  headers: {
                    Authorization: `Bearer ${key}`,
                  },
                }
              );

              if (outputFileResponse.ok) {
                const outputFileData: BrowserUseOutputFileResponse =
                  (await outputFileResponse.json()) as BrowserUseOutputFileResponse;
                const finalMarkdownUrl = outputFileData.download_url;

                // Download and parse markdown content
                if (finalMarkdownUrl) {
                  finalMarkdown =
                    await downloadMarkdownContent(finalMarkdownUrl);
                  if (finalMarkdown) {
                    logger.log(
                      `Successfully downloaded markdown content: ${finalMarkdown.length} characters`
                    );
                  }
                }
              }

              const stepsResponse = await fetch(
                `${BROWSER_USE_API_URL}/task/${taskId}`,
                {
                  headers: {
                    Authorization: `Bearer ${key}`,
                  },
                }
              );

              if (stepsResponse.ok) {
                const stepsData: BrowserUseStepsResponse =
                  (await stepsResponse.json()) as BrowserUseStepsResponse;

                if (stepsInfo.length < stepsData.steps.length) {
                  const temp = stepsData.steps.slice(
                    stepsInfo.length,
                    stepsInfo.length + 1
                  );
                  for (const step of temp) {
                    const data = {
                      next_goal: step.next_goal,
                      url: step.url,
                    };
                    stepsInfo.push(data);
                    await writer.write({
                      type: 'tool-incomplete-result',
                      toolCallId,
                      data: {
                        type: 'text-delta',
                        textDelta: JSON.stringify(data),
                      },
                    });
                  }
                }
              }

              writer.releaseLock();

              // If getting steps fails, return empty array
              return {
                currentStatus,
                currentScreenshot,
                finalGif,
                finalMarkdown,
                stepsInfo,
              };
            }
          }

          return {
            currentStatus,
            currentScreenshot,
            finalGif,
            finalMarkdown,
            stepsInfo,
          };
        } catch (err: any) {
          logger.error(`Failed to execute browser use task`, err);
          return toolError(
            'Browser Use Task Failed',
            err.message ?? String(err)
          );
        }
      },
    }
  );
};
