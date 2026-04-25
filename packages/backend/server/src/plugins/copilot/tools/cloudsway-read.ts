import { z } from 'zod';

import { Config } from '../../../base';
import { toolError } from './error';
import { createTool } from './utils';

type Format = 'HTML' | 'TEXT' | 'MARKDOWN';

export const createCloudswayReadTool = (config: Config) => {
  return createTool(
    { toolName: 'web_crawl_cloudsway' },
    {
      description:
        'Read and extract full content from a web page via Cloudsway',
      inputSchema: z.object({
        url: z
          .string()
          .url()
          .describe('The URL to crawl (including http:// or https://)'),
        formats: z
          .array(z.enum(['HTML', 'TEXT', 'MARKDOWN']))
          .nonempty()
          .optional()
          .describe('Output content formats, default ["TEXT"]'),
        mode: z
          .enum(['quality', 'fast'])
          .optional()
          .describe('Crawl mode, default "quality"'),
      }),
      execute: async ({ url, formats, mode }) => {
        try {
          const { basePath, readEndpoint, accessKey } =
            config.copilot.cloudsway;

          const endpoint = new URL(`search/${readEndpoint}/read`, basePath);
          const body = {
            url,
            formats: (formats?.length ? formats : ['TEXT']) as Format[],
            mode: mode || 'quality',
          } as const;

          const res = await fetch(endpoint.toString(), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(
              `HTTP ${res.status} ${res.statusText} ${text}`.trim()
            );
          }

          const data: any = await res.json();
          // Choose primary content based on requested formats priority: MARKDOWN > TEXT > HTML
          const preferred = body.formats as Format[];
          const pickContent = (): string | undefined => {
            for (const f of preferred) {
              if (f === 'MARKDOWN' && data?.markdown) return data.markdown;
              if (f === 'TEXT' && data?.text) return data.text;
              if (f === 'HTML' && data?.html) return data.html;
            }
            return data?.text || data?.markdown || data?.html;
          };

          return [
            {
              title: data?.metadata?.title || null,
              url,
              content: pickContent(),
              html: data?.html,
              markdown: data?.markdown,
              text: data?.text,
            },
          ];
        } catch (e: any) {
          return toolError('Cloudsway Read Failed', e?.message || String(e));
        }
      },
    }
  );
};
