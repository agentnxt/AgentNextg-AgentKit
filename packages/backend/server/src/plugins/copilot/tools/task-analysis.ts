import { Logger } from '@nestjs/common';
import { z } from 'zod';

import type { PromptService } from '../prompt';
import type { CopilotProviderFactory } from '../providers';
import { type ToolError, toolError } from './error';
import { Tools } from './types';
import { createTool } from './utils';

const logger = new Logger('TaskAnalysisTool');

// Zod schema for structured output
export const TaskAnalysisResultSchema = z.object({
  needsPhases: z.boolean(),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  estimatedSteps: z.number().min(1).max(20),
  todoList: z.array(
    z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
      estimatedTime: z.string(),
      requiredTools: z.array(z.string()),
      dependencies: z.array(z.number()),
    })
  ),
  reasoning: z.string(),
  suggestedApproach: z.string(),
});

export type TaskAnalysisResult = z.infer<typeof TaskAnalysisResultSchema>;

export const createTaskAnalysisTool = (
  sessionId: string | undefined,
  promptService: PromptService,
  factory: CopilotProviderFactory
) => {
  return createTool(
    { toolName: 'task_analysis' },
    {
      description:
        'Analyze a user task to determine if it needs to be broken down into phases, estimate the number of steps required, create a todo list, and identify which tools might be needed for each step. You should use this tool to confirm whether a task is complex and whether it needs to be broken down whenever you encounter any potentially complex tasks (such as those involving report creation, data analysis, or writing complex code).',
      inputSchema: z.object({
        task: z.string().describe('The user task to analyze and break down'),
        context: z
          .string()
          .optional()
          .describe(
            'Additional context about the task, user requirements, or constraints'
          ),
        availableTools: z
          .array(z.string())
          .optional()
          .describe('List of available tools that could be used for this task'),
      }),
      execute: async ({
        task,
        context,
        availableTools,
      }): Promise<TaskAnalysisResult | ToolError> => {
        try {
          if (!task || task.trim().length === 0) {
            return toolError(
              'Invalid Task',
              'Task description cannot be empty'
            );
          }

          const prompt = await promptService.get('Task Analysis');
          const provider = await factory.getProviderByModel(
            prompt?.model || ''
          );
          if (!prompt || !provider) {
            return toolError(
              'Prompt Not Found',
              'Failed to analyze task. No provider available.'
            );
          }
          const json = await provider.structure(
            { modelId: prompt.model },
            prompt.finish(
              Object.assign({
                schema: TaskAnalysisResultSchema,
                task: task.trim(),
                context: context || 'No additional context provided',
                availableTools: (availableTools || Tools).join(', '),
                currentDate: new Date().toISOString(),
              })
            )
          );

          const result = TaskAnalysisResultSchema.parse(JSON.parse(json));

          logger.verbose(
            `Task analysis completed for session ${sessionId}: ${result.needsPhases ? 'Multi-phase' : 'Single-phase'} task with ${result.estimatedSteps} steps`
          );

          return result;
        } catch (err: any) {
          logger.error(`Failed to analyze task (${sessionId})`, err);
          return toolError('Task Analysis Failed', err.message) as any;
        }
      },
    }
  );
};
