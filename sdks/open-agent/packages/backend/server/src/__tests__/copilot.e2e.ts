import { randomUUID } from 'node:crypto';

import { ChatHistoryOrder } from '@afk/graphql';
import { ProjectRoot } from '@afk-tools/utils/path';
import { PrismaClient } from '@prisma/client';
import type { TestFn } from 'ava';
import ava from 'ava';
import Sinon from 'sinon';

import { AppModule } from '../app.module';
import { JobQueue } from '../base';
import { ConfigModule } from '../base/config';
import { AuthService } from '../core/auth';
import { CopilotContextService } from '../plugins/copilot/context';
import {
  CopilotEmbeddingJob,
  MockEmbeddingClient,
} from '../plugins/copilot/embedding';
import { prompts, PromptService } from '../plugins/copilot/prompt';
import {
  CopilotProviderFactory,
  CopilotProviderType,
  GeminiGenerativeProvider,
  OpenAIProvider,
} from '../plugins/copilot/providers';
import { CopilotStorage } from '../plugins/copilot/storage';
import { MockCopilotProvider } from './mocks';
import { createTestingApp, TestingApp, TestUser } from './utils';
import {
  addContextFile,
  array2sse,
  audioTranscription,
  chatWithImages,
  chatWithStreamObject,
  chatWithText,
  chatWithTextStream,
  chatWithWorkflow,
  claimAudioTranscription,
  cleanObject,
  createCopilotContext,
  createCopilotMessage,
  createCopilotSession,
  createPinnedCopilotSession,
  createUserCopilotSession,
  getCopilotSession,
  getHistories,
  getPinnedSessions,
  getUserSessions,
  listContext,
  listContextFiles,
  sse2array,
  submitAudioTranscription,
  textToEventStream,
  unsplashSearch,
  updateCopilotSession,
} from './utils/copilot';

const test = ava as TestFn<{
  auth: AuthService;
  app: TestingApp;
  db: PrismaClient;
  context: CopilotContextService;
  jobs: CopilotEmbeddingJob;
  prompt: PromptService;
  factory: CopilotProviderFactory;
  storage: CopilotStorage;
  u1: TestUser;
}>;

test.before(async t => {
  const app = await createTestingApp({
    imports: [
      ConfigModule.override({
        copilot: {
          providers: {
            openai: { apiKey: '1' },
            fal: {},
            gemini: { apiKey: '1' },
          },
          unsplash: {
            key: process.env.UNSPLASH_ACCESS_KEY || '1',
          },
        },
      }),
      AppModule,
    ],
    tapModule: m => {
      // use real JobQueue for testing
      m.overrideProvider(JobQueue).useClass(JobQueue);
      m.overrideProvider(OpenAIProvider).useClass(MockCopilotProvider);
      m.overrideProvider(GeminiGenerativeProvider).useClass(
        class MockGenerativeProvider extends MockCopilotProvider {
          // @ts-expect-error
          override type: CopilotProviderType = CopilotProviderType.Gemini;
        }
      );
    },
  });

  const auth = app.get(AuthService);
  const db = app.get(PrismaClient);
  const context = app.get(CopilotContextService);
  const prompt = app.get(PromptService);
  const storage = app.get(CopilotStorage);
  const jobs = app.get(CopilotEmbeddingJob);

  t.context.app = app;
  t.context.db = db;
  t.context.auth = auth;
  t.context.context = context;
  t.context.prompt = prompt;
  t.context.storage = storage;
  t.context.jobs = jobs;
});

let textPromptName = 'prompt';
let imagePromptName = 'prompt-image';

test.beforeEach(async t => {
  Sinon.restore();
  const { app, prompt } = t.context;
  await prompt.onApplicationBootstrap();
  t.context.u1 = await app.signupV1();
  textPromptName = randomUUID().replaceAll('-', '');
  imagePromptName = randomUUID().replaceAll('-', '');

  await prompt.set(textPromptName, 'test', [
    { role: 'system', content: 'hello {{word}}' },
  ]);

  await prompt.set(imagePromptName, 'test-image', [
    { role: 'system', content: 'hello {{word}}' },
  ]);
});

test.after.always(async t => {
  await t.context.app.close();
});

// ==================== session ====================

test('should create and update session correctly', async t => {
  const { app } = t.context;

  t.truthy(
    await createCopilotSession(app, textPromptName),
    'should be able to create session with text prompt'
  );

  const assertUpdateSession = async (
    sessionId: string,
    error: string,
    asserter = async (x: any) => {
      t.truthy(await x, error);
    }
  ) => {
    await asserter(updateCopilotSession(app, sessionId, textPromptName));
  };

  {
    const sessionId = await createCopilotSession(app, textPromptName);
    await assertUpdateSession(
      sessionId,
      'should be able to update session with cloud workspace that user can access'
    );
  }

  {
    const sessionId = '123456';
    await assertUpdateSession(sessionId, '', async x => {
      await t.throwsAsync(
        x,
        { instanceOf: Error },
        'should not able to update invalid session id'
      );
    });
  }
});

test('should be able to use test provider', async t => {
  const { app } = t.context;

  t.truthy(
    await createCopilotSession(app, textPromptName),
    'failed to create session'
  );
});

// ==================== message ====================

test('should create message correctly', async t => {
  const { app } = t.context;

  {
    const sessionId = await createCopilotSession(app, textPromptName);
    const messageId = await createCopilotMessage(app, sessionId);
    t.truthy(messageId, 'should be able to create message with valid session');
  }

  {
    // with attachment
    {
      const sessionId = await createCopilotSession(app, textPromptName);
      const smallestPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';
      const pngData = await fetch(smallestPng).then(res => res.arrayBuffer());
      const messageId = await createCopilotMessage(
        app,
        sessionId,
        undefined,
        new File([new Uint8Array(pngData)], '1.png', { type: 'image/png' })
      );
      t.truthy(messageId, 'should be able to create message with blob');
    }

    // with attachments
    {
      const sessionId = await createCopilotSession(app, textPromptName);
      const smallestPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';
      const pngData = await fetch(smallestPng).then(res => res.arrayBuffer());
      const messageId = await createCopilotMessage(
        app,
        sessionId,
        undefined,
        undefined,
        [new File([new Uint8Array(pngData)], '1.png', { type: 'image/png' })]
      );
      t.truthy(messageId, 'should be able to create message with blobs');
    }
  }

  {
    await t.throwsAsync(
      createCopilotMessage(app, randomUUID()),
      { instanceOf: Error },
      'should not able to create message with invalid session'
    );
  }
});

// ==================== chat ====================

test('should be able to chat with api', async t => {
  const { app, storage } = t.context;

  Sinon.stub(storage, 'handleRemoteLink').resolvesArg(2);

  {
    const sessionId = await createCopilotSession(app, textPromptName);
    const messageId = await createCopilotMessage(app, sessionId);
    const ret = await chatWithText(app, sessionId, messageId);
    t.is(ret, 'generate text to text', 'should be able to chat with text');

    const ret2 = await chatWithTextStream(app, sessionId, messageId);
    t.is(
      ret2,
      textToEventStream('generate text to text stream', messageId),
      'should be able to chat with text stream'
    );
  }

  {
    const sessionId = await createCopilotSession(app, imagePromptName);
    const messageId = await createCopilotMessage(app, sessionId);
    const ret3 = await chatWithImages(app, sessionId, messageId);
    t.is(
      array2sse(sse2array(ret3).filter(e => e.event !== 'event')),
      textToEventStream(
        ['https://example.com/test-image.jpg', 'hello '],
        messageId,
        'attachment'
      ),
      'should be able to chat with images'
    );
  }

  {
    const sessionId = await createCopilotSession(app, textPromptName);
    const messageId = await createCopilotMessage(app, sessionId);

    const ret4 = await chatWithStreamObject(app, sessionId, messageId);

    const objects = Array.from('generate text to object stream').map(data =>
      JSON.stringify({ type: 'text-delta', textDelta: data })
    );

    t.is(
      ret4.replace(/\nevent:.*\nid:.*\ndata: {"type":"status".*}\n/gm, ''),
      textToEventStream(objects, messageId),
      'should be able to chat with stream object'
    );
  }

  Sinon.restore();
});

test('should be able to chat with api by workflow', async t => {
  const { app } = t.context;

  const sessionId = await createCopilotSession(app, 'workflow:presentation');
  const messageId = await createCopilotMessage(app, sessionId, 'apple company');
  const ret = await chatWithWorkflow(app, sessionId, messageId);
  t.is(
    array2sse(sse2array(ret).filter(e => e.event !== 'event')),
    textToEventStream(['generate text to text stream'], messageId),
    'should be able to chat with workflow'
  );
});

test('should be able to chat with special image model', async t => {
  const { app, storage } = t.context;

  Sinon.stub(storage, 'handleRemoteLink').resolvesArg(2);

  const smallestPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';
  const pngData = await fetch(smallestPng).then(res => res.arrayBuffer());
  const testWithModel = async (promptName: string, finalPrompt: string) => {
    const model = prompts.find(p => p.name === promptName)?.model;
    const sessionId = await createCopilotSession(app, promptName);

    const messageId = await createCopilotMessage(
      app,
      sessionId,
      'some-tag',
      new File([new Uint8Array(pngData)], '1.png', { type: 'image/png' })
    );
    const ret3 = await chatWithImages(app, sessionId, messageId);
    t.is(
      ret3,
      textToEventStream(
        [`https://example.com/${model}.jpg`, finalPrompt],
        messageId,
        'attachment'
      ),
      'should be able to chat with images'
    );
  };

  await testWithModel('Generate image', 'some-tag');
  await testWithModel(
    'Convert to sticker',
    'convert this image to sticker. you need to identify the subject matter and warp a circle of white stroke around the subject matter and with transparent background. some-tag'
  );
  await testWithModel(
    'Upscale image',
    'make the image more detailed. some-tag'
  );
  await testWithModel(
    'Remove background',
    'Keep the subject and remove other non-subject items. Transparent background. some-tag'
  );

  Sinon.restore();
});

test('should be able to retry with api', async t => {
  const { app, storage } = t.context;

  Sinon.stub(storage, 'handleRemoteLink').resolvesArg(2);

  // normal chat
  {
    const sessionId = await createCopilotSession(app, textPromptName);
    const messageId = await createCopilotMessage(app, sessionId);
    // chat 2 times
    await chatWithText(app, sessionId, messageId);
    await chatWithText(app, sessionId, messageId);

    const histories = await getHistories(app);
    t.deepEqual(
      histories.map(h => h.messages.map(m => m.content)),
      [['generate text to text', 'generate text to text']],
      'should be able to list history'
    );
  }

  // retry chat
  {
    const sessionId = await createCopilotSession(app, textPromptName);
    const messageId = await createCopilotMessage(app, sessionId);
    await chatWithText(app, sessionId, messageId);
    // retry without message id
    await chatWithText(app, sessionId);

    // should only have 1 message
    const histories = await getHistories(app, {
      pagination: {},
      options: { sessionId, withMessages: true },
    });
    t.snapshot(
      cleanObject(histories),
      'should only have 1 message after retry'
    );
  }

  // retry chat with new message id
  {
    const sessionId = await createCopilotSession(app, textPromptName);
    const messageId = await createCopilotMessage(app, sessionId);
    await chatWithText(app, sessionId, messageId);
    // retry with new message id
    const newMessageId = await createCopilotMessage(app, sessionId);
    await chatWithText(app, sessionId, newMessageId, '', true);

    // should only have 1 message
    const histories = await getHistories(app, {
      pagination: {},
      options: { sessionId, withMessages: true },
    });
    t.snapshot(
      cleanObject(histories),
      'should only have 1 message after retry with new message id'
    );
  }

  Sinon.restore();
});

test('should reject message from different session', async t => {
  const { app } = t.context;

  const sessionId = await createCopilotSession(app, textPromptName);
  const anotherSessionId = await createCopilotSession(app, textPromptName);
  const anotherMessageId = await createCopilotMessage(app, anotherSessionId);
  await t.throwsAsync(
    chatWithText(app, sessionId, anotherMessageId),
    { instanceOf: Error },
    'should reject message from different session'
  );
});

test('should reject request from different user', async t => {
  const { app, u1 } = t.context;

  const u2 = await app.createUser();
  const sessionId = await createCopilotSession(app, textPromptName);

  // should reject message from different user
  {
    await app.login(u2);
    await t.throwsAsync(
      createCopilotMessage(app, sessionId),
      { instanceOf: Error },
      'should reject message from different user'
    );
  }

  // should reject chat from different user
  {
    await app.switchUser(u1);
    const messageId = await createCopilotMessage(app, sessionId);
    {
      await app.switchUser(u2);
      await t.throwsAsync(
        chatWithText(app, sessionId, messageId),
        { instanceOf: Error },
        'should reject chat from different user'
      );
    }
  }
});

// ==================== history ====================

test('should be able to list history', async t => {
  const { app } = t.context;

  const sessionId = await createCopilotSession(app, textPromptName);
  const messageId = await createCopilotMessage(app, sessionId, 'hello');
  await chatWithText(app, sessionId, messageId);

  {
    const histories = await getHistories(app);
    t.deepEqual(
      histories.map(h => h.messages.map(m => m.content)),
      [['hello', 'generate text to text']],
      'should be able to list history'
    );
  }

  {
    const histories = await getHistories(app, {
      pagination: {},
      options: { messageOrder: ChatHistoryOrder.desc, withMessages: true },
    });
    t.deepEqual(
      histories.map(h => h.messages.map(m => m.content)),
      [['generate text to text', 'hello']],
      'should be able to list history'
    );
  }
});

test('should reject request that user have not permission', async t => {
  const { app } = t.context;

  {
    const sessionId = await createCopilotSession(app, textPromptName);

    const messageId = await createCopilotMessage(app, sessionId);
    await chatWithText(app, sessionId, messageId);

    const histories = await getHistories(app);
    t.deepEqual(
      histories.map(h => h.messages.map(m => m.content)),
      [['generate text to text']],
      'should able to list history'
    );

    const u2 = await app.createUser();
    await app.login(u2);
    t.deepEqual(
      await getHistories(app),
      [],
      'should not list history created by another user'
    );
  }
});

test('should be able to search image from unsplash', async t => {
  const { app } = t.context;

  const resp = await unsplashSearch(app);
  t.not(resp.status, 404, 'route should be exists');
});

test('should be able to manage context', async t => {
  const { app, context, jobs } = t.context;

  const sessionId = await createCopilotSession(app, textPromptName);

  // use mocked embedding client
  Sinon.stub(context, 'embeddingClient').get(() => new MockEmbeddingClient());
  Sinon.stub(jobs, 'embeddingClient').get(() => new MockEmbeddingClient());

  {
    await t.throwsAsync(
      createCopilotContext(app, randomUUID()),
      { instanceOf: Error },
      'should throw error if create context with invalid session id'
    );

    const context = await createCopilotContext(app, sessionId);

    const list = await listContext(app, sessionId);
    t.deepEqual(
      list.map(f => ({ id: f.id })),
      [{ id: context }],
      'should list context'
    );
  }

  const fs = await import('node:fs');
  const buffer = fs.readFileSync(
    ProjectRoot.join('packages/common/native/fixtures/sample.pdf').toFileUrl()
  );

  // match files
  {
    const contextId = await createCopilotContext(app, sessionId);

    await addContextFile(app, contextId, 'sample.pdf', buffer);

    const { files } = (await listContextFiles(app, sessionId, contextId)) || {};
    t.snapshot(
      cleanObject(files, ['id', 'error', 'createdAt']),
      'should list context files'
    );

    // wait for processing
    {
      let { files } =
        (await listContextFiles(
          app,

          sessionId,
          contextId
        )) || {};

      while (files?.[0].status !== 'finished') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        ({ files } =
          (await listContextFiles(
            app,

            sessionId,
            contextId
          )) || {});
      }
    }

    // const result = (await matchFiles(app, contextId, 'test', 1))!;
    // t.is(result.length, 1, 'should match context');
    // t.is(result[0].fileId, fileId, 'should match file id');
  }
});

test('should be able to transcript', async t => {
  const { app } = t.context;

  for (const [provider, func] of [
    [GeminiGenerativeProvider, 'text'],
    [GeminiGenerativeProvider, 'structure'],
  ] as const) {
    Sinon.stub(app.get(provider), func).resolves(
      JSON.stringify([
        { a: 'A', s: 30, e: 45, t: 'Hello, everyone.' },
        {
          a: 'B',
          s: 46,
          e: 70,
          t: 'Hi, thank you for joining the meeting today.',
        },
      ])
    );
  }

  {
    const job = await submitAudioTranscription(app, '1', '1.mp3', [
      Buffer.from([1, 1]),
    ]);
    t.snapshot(
      cleanObject([job], ['id']),
      'should submit audio transcription job'
    );
    t.truthy(job.id, 'should have job id');

    // wait for processing
    {
      let { status } = (await audioTranscription(app, job.id)) || {};

      while (status !== 'finished') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        ({ status } = (await audioTranscription(app, job.id)) || {});
      }
    }

    {
      const result = await claimAudioTranscription(app, job.id);
      t.snapshot(
        cleanObject([result], ['id']),
        'should claim audio transcription job'
      );
    }
  }

  {
    // sliced audio
    const job = await submitAudioTranscription(app, '2', '2.mp3', [
      Buffer.from([1, 1]),
      Buffer.from([1, 2]),
    ]);
    t.snapshot(
      cleanObject([job], ['id']),
      'should submit audio transcription job'
    );
    t.truthy(job.id, 'should have job id');

    // wait for processing
    {
      let { status } = (await audioTranscription(app, job.id)) || {};

      while (status !== 'finished') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        ({ status } = (await audioTranscription(app, job.id)) || {});
      }
    }

    {
      const result = await claimAudioTranscription(app, job.id);
      t.snapshot(
        cleanObject([result], ['id']),
        'should claim audio transcription job'
      );
    }
  }
});

test('should create different session types and validate prompt constraints', async t => {
  const { app } = t.context;

  const validateSession = async (
    description: string,
    createPromise: Promise<string>
  ) => {
    const sessionId = await createPromise;

    t.truthy(sessionId, description);
    t.snapshot(
      cleanObject(
        [await getCopilotSession(app, sessionId)],
        ['id', 'workspaceId', 'promptName']
      ),
      `should create session with ${description}`
    );
    return sessionId;
  };

  await validateSession(
    'should create user session with text prompt',
    createUserCopilotSession(app, textPromptName)
  );
  await validateSession(
    'should create pinned session with text prompt',
    createPinnedCopilotSession(app, textPromptName)
  );
});

test('should list histories for different session types correctly', async t => {
  const { app } = t.context;

  // create sessions and add messages
  const [userSessionId, pinnedSessionId] = await Promise.all([
    createUserCopilotSession(app, textPromptName),
    createPinnedCopilotSession(app, textPromptName),
  ]);

  await Promise.all([
    createCopilotMessage(app, userSessionId, 'workspace message'),
    createCopilotMessage(app, pinnedSessionId, 'pinned message'),
  ]);

  const testHistoryQuery = async (
    queryFn: () => Promise<any[]>,
    opts: {
      sessionIds?: string[];
      sessionId?: string;
      pinned?: boolean;
      isEmpty?: boolean;
    },
    description: string
  ) => {
    const s = await queryFn();

    if (opts.isEmpty) {
      t.is(s.length, 0, `should return ${description}`);
      return;
    }

    if (opts.sessionIds) {
      t.is(s.length, opts.sessionIds.length, `should return ${description}`);
      const ids = s.map(h => h.sessionId).sort((a, b) => a.localeCompare(b));
      const expectedIds = opts.sessionIds.sort((a, b) => a.localeCompare(b));
      t.deepEqual(ids, expectedIds, `should return correct ${description}`);
    } else if (opts.sessionId) {
      t.is(s.length, 1, `should return ${description}`);
      t.is(
        s[0].sessionId,
        opts.sessionId,
        `should return correct ${description}`
      );
      if (opts.pinned !== undefined) {
        t.is(s[0].pinned, opts.pinned, `pinned status for ${description}`);
      }
    }
  };

  // test for getHistories
  await testHistoryQuery(
    () => getHistories(app, { pagination: {}, options: { pinned: true } }),
    { sessionId: pinnedSessionId },
    'pinned session history'
  );
  // test for getUserSessions
  await testHistoryQuery(
    () => getUserSessions(app),
    { sessionId: userSessionId },
    'user-level session history'
  );
  // test for getPinnedSessions
  await testHistoryQuery(
    () => getPinnedSessions(app),
    { sessionId: pinnedSessionId, pinned: true },
    'pinned sessions'
  );
});
