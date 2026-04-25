import { Logger } from '@nestjs/common';
import { z } from 'zod';

import { PromptService } from '../prompt';
import { CopilotProviderFactory, StreamObjectToolResult } from '../providers';
import { SaveDocFunc } from './doc-compose';
import { toolError } from './error';
import { createTool } from './utils';
import { duplicateStreamObjectStream } from './utils';
const logger = new Logger('MakeItRealTool');

export const createMakeItRealTool = (
  toolStream: WritableStream<StreamObjectToolResult>,
  promptService: PromptService,
  factory: CopilotProviderFactory,
  saveDoc: SaveDocFunc
) => {
  return createTool(
    { toolName: 'make_it_real' },
    {
      description: `This tool(make-it-real) is used to improve the document with more beautiful layout or slide show.`,
      inputSchema: z.object({
        instructions: z
          .string()
          .optional()
          .describe("User's special requirements."),
        markdown: z.string().describe('The markdown content'),
      }),
      execute: async (
        { instructions, markdown },
        { toolCallId, abortSignal }
      ) => {
        try {
          const prompt = await promptService.get('make-it-real');
          if (!prompt) {
            throw new Error(`Prompt('make-it-real') not found`);
          }
          const provider = await factory.getProviderByModel(prompt.model);
          if (!provider) {
            throw new Error('Provider not found');
          }

          const originalStream = provider.streamObject(
            { modelId: prompt.model },
            prompt.finish({
              instructions: instructions ?? 'No instructions',
              content: markdown,
            })
          );

          const content = await duplicateStreamObjectStream(
            toolCallId,
            originalStream,
            toolStream,
            abortSignal
          );

          return await saveDoc(content);
        } catch (err: any) {
          logger.error(`Failed to make it real layout enhancer`, err);
          return toolError(
            'Make It Real Layout Enhancer Failed',
            err.message ?? String(err)
          );
        }
      },
    }
  );
};
