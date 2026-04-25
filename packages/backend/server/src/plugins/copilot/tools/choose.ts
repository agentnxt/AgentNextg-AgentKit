import { z } from 'zod';

import { createTool } from './utils';

export const createChooseTool = () => {
  return createTool(
    { toolName: 'choose' },
    {
      description:
        'Present multiple options to the user for selection. The user can either choose from the provided options or provide their own input. The content of the options should be provided in the language used by the user.',
      inputSchema: z.object({
        question: z.string().describe('The question or prompt to ask the user'),
        options: z
          .array(z.string())
          // .describe('Array of options for the user to choose from')
          .describe(
            'Array of options for the user to choose from. MUST be provided as an array, e.g., ["Option 1", "Option 2", "Option 3"]. Do NOT provide as a string.'
          )
          .min(2, 'At least 2 options are required'),
        multiSelect: z
          .boolean()
          .optional()
          .default(false)
          .describe('Whether the user can select multiple options'),
      }),
      execute: async ({ question, options, multiSelect }) => {
        return { question, options, multiSelect };
      },
    }
  );
};
