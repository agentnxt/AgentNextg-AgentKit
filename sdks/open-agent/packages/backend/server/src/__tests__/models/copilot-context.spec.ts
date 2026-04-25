import { randomUUID } from 'node:crypto';

import { PrismaClient, User } from '@prisma/client';
import ava, { TestFn } from 'ava';

import { Config } from '../../base';
import {
  ArtifactEmbedStatus,
  CopilotContextModel,
  CopilotSessionModel,
  CopilotUserConfigModel,
  UserModel,
} from '../../models';
import { createTestingModule, type TestingModule } from '../utils';

interface Context {
  config: Config;
  module: TestingModule;
  db: PrismaClient;
  user: UserModel;
  copilotSession: CopilotSessionModel;
  copilotContext: CopilotContextModel;
  copilotWorkspace: CopilotUserConfigModel;
}

const test = ava as TestFn<Context>;

test.before(async t => {
  const module = await createTestingModule();
  t.context.user = module.get(UserModel);
  t.context.copilotSession = module.get(CopilotSessionModel);
  t.context.copilotContext = module.get(CopilotContextModel);
  t.context.copilotWorkspace = module.get(CopilotUserConfigModel);
  t.context.db = module.get(PrismaClient);
  t.context.config = module.get(Config);
  t.context.module = module;
});

let user: User;
let sessionId: string;

test.beforeEach(async t => {
  await t.context.module.initTestingDB();
  await t.context.copilotSession.createPrompt('prompt-name', 'gpt-5-mini');
  user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
  sessionId = await t.context.copilotSession.create({
    sessionId: randomUUID(),
    userId: user.id,
    title: null,
    promptName: 'prompt-name',
    promptAction: null,
    metadata: '',
  });
});

test.after(async t => {
  await t.context.module.close();
});

test('should create a copilot context', async t => {
  const { id: contextId } = await t.context.copilotContext.create(sessionId);
  t.truthy(contextId);

  const context = await t.context.copilotContext.get(contextId);
  t.is(context?.id, contextId, 'should get context by id');

  const config = await t.context.copilotContext.getConfig(contextId);
  t.is(config?.userId, user.id, 'should get context config');

  const context1 = await t.context.copilotContext.getBySessionId(sessionId);
  t.is(context1?.id, contextId, 'should get context by session id');
});

test('should get null for non-exist job', async t => {
  const job = await t.context.copilotContext.get('non-exist');
  t.snapshot(job, 'should return null for non-exist job');
});

test('should update context', async t => {
  const { copilotContext } = t.context;
  const { id: contextId } = await copilotContext.create(sessionId);
  const config = await copilotContext.getConfig(contextId);

  config?.files.push({
    id: 'file1',
    chunkSize: 1024,
    name: 'file1.txt',
    mimeType: 'text/plain',
    status: ArtifactEmbedStatus.finished,
    error: null,
    blobId: 'blob1',
    createdAt: Date.now(),
  });
  await copilotContext.update(contextId, { config });

  const config1 = await copilotContext.getConfig(contextId);
  t.deepEqual(config1, config);
});
