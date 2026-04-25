import { z } from 'zod';

import type { ChunkSimilarity } from '../../../models';
import type { CopilotContextService } from '../context';
import type { ContextSession } from '../context/session';
import type { CopilotChatOptions } from '../providers';
import { toolError } from './error';
import { createTool } from './utils';

const FILTER_PREFIX = [
  'Title: ',
  'Created at: ',
  'Updated at: ',
  'Created by: ',
  'Updated by: ',
];

function clearEmbeddingChunk(chunk: ChunkSimilarity): ChunkSimilarity {
  if (chunk.content) {
    const lines = chunk.content.split('\n');
    let maxLines = 5;
    while (maxLines > 0 && lines.length > 0) {
      if (FILTER_PREFIX.some(prefix => lines[0].startsWith(prefix))) {
        lines.shift();
        maxLines--;
      } else {
        // only process consecutive metadata rows
        break;
      }
    }
    return { ...chunk, content: lines.join('\n') };
  }
  return chunk;
}

export const buildDocSearchGetter = (
  context: CopilotContextService,
  docContext: ContextSession | null
) => {
  const searchDocs = async (
    options: CopilotChatOptions,
    query?: string,
    abortSignal?: AbortSignal
  ) => {
    if (!options || !query?.trim() || !options.user) {
      return `Invalid search parameters.`;
    }

    const [chunks, contextChunks] = await Promise.all([
      context.matchFiles(query, options.user, 10, abortSignal),
      docContext?.matchFiles(query, 10, abortSignal) ?? [],
    ]);

    const fileChunks = chunks.filter(c => 'fileId' in c);
    if (contextChunks.length) {
      fileChunks.push(...contextChunks);
    }
    if (!fileChunks.length) return `No results found for "${query}".`;

    return fileChunks.map(clearEmbeddingChunk) as ChunkSimilarity[];
  };
  return searchDocs;
};

export const createDocSemanticSearchTool = (
  searchDocs: (
    query: string,
    abortSignal?: AbortSignal
  ) => Promise<ChunkSimilarity[] | string | undefined>
) => {
  return createTool(
    { toolName: 'doc_semantic_search' },
    {
      description:
        'Retrieve conceptually related passages by performing vector-based semantic similarity search across embedded documents; use this tool only when exact keyword search fails or the user explicitly needs meaning-level matches (e.g., paraphrases, synonyms, broader concepts, recent documents).',
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            'The query statement to search for, e.g. "What is the capital of France?"\nWhen querying specific terms or IDs, you should provide the complete string instead of separating it with delimiters.\nFor example, if a user wants to look up the ID "sicDoe1is", use "What is sicDoe1is" instead of "si code 1is".'
          ),
      }),
      execute: async ({ query }, options) => {
        try {
          return await searchDocs(query, options.abortSignal);
        } catch (e: any) {
          return toolError('Doc Semantic Search Failed', e.message);
        }
      },
    }
  );
};
