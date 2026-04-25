import { Logger } from '@nestjs/common';
import { z } from 'zod';

import { PromptService } from '../prompt';
import { CopilotProviderFactory, StreamObjectToolResult } from '../providers';
import { toolError } from './error';
import { createTool, duplicateStreamObjectStream } from './utils';
const logger = new Logger('PythonCodingTool');

export const createPythonCodingTool = (
  toolStream: WritableStream<StreamObjectToolResult>,
  promptService: PromptService,
  factory: CopilotProviderFactory
) => {
  return createTool(
    { toolName: 'python_coding' },
    {
      description: 'This tool(python-coding) is used to generate python code',
      inputSchema: z.object({
        requirements: z
          .string()
          .describe('The requirements to generate python code'),
      }),
      execute: async ({ requirements }, { toolCallId, abortSignal }) => {
        logger.log('pythonCodingTool', requirements);
        try {
          const prompt = await promptService.get('Generate python code');
          if (!prompt) {
            throw new Error(`Prompt('Generate python code') not found`);
          }
          const provider = await factory.getProviderByModel(prompt.model);
          if (!provider) {
            throw new Error(`Provider for model ${prompt.model} not found`);
          }

          const originalStream = provider.streamObject(
            { modelId: prompt.model },
            prompt.finish({
              requirements,
            })
          );

          const result = await duplicateStreamObjectStream(
            toolCallId,
            originalStream,
            toolStream,
            abortSignal
          );

          logger.log('pythonCodingTool finished:', result);
          return result;
        } catch (err: any) {
          logger.error('pythonCodingTool error', err);
          return toolError(
            'Python Coding Tool Failed',
            err.message ?? String(err)
          );
        }
      },
    }
  );
};
