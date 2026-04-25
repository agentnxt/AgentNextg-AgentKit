import { z } from 'zod';

import { Config } from '../../../base';
import { toolError } from './error';
import { createTool } from './utils';

export const createCloudswaySearchTool = (config: Config) => {
  return createTool(
    { toolName: 'web_search_cloudsway' },
    {
      description: 'Search the web for information via Cloudsway',
      inputSchema: z.object({
        query: z.string().min(1).describe('The query to search the web for.'),
        count: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Number of results to return.'),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Zero-based offset for pagination.'),
        freshness: z
          .string()
          .optional()
          .describe(
            'Filter by time. Day | Week | Month | or date range YYYY-MM-DD..YYYY-MM-DD'
          ),
        safeSearch: z
          .enum(['Off', 'Moderate', 'Strict'])
          .optional()
          .describe('Adult content filter'),
        mkt: z.string().optional().describe('Market, e.g. en-US'),
        cc: z.string().optional().describe('2-letter country code'),
      }),
      execute: async ({
        query,
        count,
        offset,
        freshness,
        safeSearch,
        mkt,
        cc,
      }) => {
        try {
          const { basePath, searchEndpoint, accessKey } =
            config.copilot.cloudsway;

          const url = new URL(`search/${searchEndpoint}/smart`, basePath);
          url.searchParams.set('q', query);
          if (count !== undefined) url.searchParams.set('count', String(count));
          if (offset !== undefined)
            url.searchParams.set('offset', String(offset));
          if (freshness) url.searchParams.set('freshness', freshness);
          if (safeSearch) url.searchParams.set('safeSearch', safeSearch);
          if (mkt) url.searchParams.set('mkt', mkt);
          if (cc) url.searchParams.set('cc', cc);

          const res = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessKey}`,
              pragma: 'no-cache',
            },
          });

          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(
              `HTTP ${res.status} ${res.statusText} ${text}`.trim()
            );
          }

          const data: any = await res.json();
          const items: any[] = data?.webPages?.value || [];

          return items.map(item => ({
            title: item?.name ?? null,
            url: item?.url,
            content: item?.snippet,
            favicon: undefined,
            publishedDate: item?.datePublished || item?.dateLastCrawled,
            author: item?.siteName,
          }));
        } catch (e: any) {
          return toolError('Cloudsway Search Failed', e?.message || String(e));
        }
      },
    }
  );
};
