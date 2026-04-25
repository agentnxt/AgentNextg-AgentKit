import { Logger } from '@nestjs/common';
import { z } from 'zod';

import { Models } from '../../../models';
import type { PromptService } from '../prompt';
import type {
  CopilotChatOptions,
  CopilotProviderFactory,
  StreamObjectToolResult,
} from '../providers';
import { toolError } from './error';
import { createTool, duplicateStreamObjectStream } from './utils';

const logger = new Logger('DocComposeTool');

export const buildSaveDocGetter = (
  models: Models,
  promptService: PromptService,
  factory: CopilotProviderFactory
) => {
  const saveDoc = async (
    options: CopilotChatOptions,
    content: string,
    title?: string
  ) => {
    if (!options || !content.trim() || !options.user || !options.session) {
      return `Invalid save doc parameters.`;
    }

    const titlePrompt = await promptService.get('Summary as title');
    const titleProvider = await factory.getProviderByModel(
      titlePrompt?.model || ''
    );
    const finalTitle =
      title ||
      (titlePrompt && titleProvider
        ? await titleProvider.text(
            { modelId: titlePrompt.model },
            titlePrompt.finish({ content })
          )
        : 'Untitled Document');
    const session = await models.copilotSession.getExists(options.session, {
      docId: true,
    });

    if (session?.docId) {
      await models.copilotUser.updateDoc(options.user, session.docId, {
        title: finalTitle,
        content,
      });
      return { docId: session.docId, title: finalTitle, content };
    } else {
      const { docId } = await models.copilotUser.addDoc(
        options.user,
        options.session,
        { title: finalTitle, content }
      );
      return { docId, title: finalTitle, content };
    }
  };
  return saveDoc;
};

type Shift<Fn> = Fn extends (arg0: any, ...rest: infer Rest) => infer R
  ? (...args: Rest) => R
  : never;
export type SaveDocFunc = Shift<Awaited<ReturnType<typeof buildSaveDocGetter>>>;

export const createDocComposeTool = (
  toolStream: WritableStream<StreamObjectToolResult>,
  promptService: PromptService,
  factory: CopilotProviderFactory,
  saveDoc: SaveDocFunc
) => {
  return createTool(
    { toolName: 'doc_compose' },
    {
      description:
        'Write a new document with markdown content. This tool creates structured markdown content for documents including titles, sections, and formatting.',
      inputSchema: z.object({
        title: z.string().describe('The title of the document'),
        userPrompt: z
          .string()
          .describe(
            'The user description of the document, will be used to generate the document'
          ),
      }),
      execute: async (args, { toolCallId, abortSignal }) => {
        const { title, userPrompt } = args;
        try {
          const prompt = await promptService.get('Write an article about this');
          if (!prompt) {
            throw new Error('Prompt not found');
          }

          const provider = await factory.getProviderByModel(prompt.model);

          if (!provider) {
            throw new Error('Provider not found');
          }
          const originalStream = provider.streamObject(
            { modelId: prompt.model },
            [...prompt.finish({}), { role: 'user', content: userPrompt }]
          );

          const content = await duplicateStreamObjectStream(
            toolCallId,
            originalStream,
            toolStream,
            abortSignal
          );

          const ret = await saveDoc(content);
          if (typeof ret === 'string') return ret;

          return {
            docId: ret.docId,
            title: ret.title,
            markdown: content,
            wordCount: content.split(/\s+/).length,
          };
        } catch (err: any) {
          logger.error(`Failed to write document: ${title}`, err);
          return toolError('Doc Write Failed', err.message);
        }
      },
    }
  );
};
