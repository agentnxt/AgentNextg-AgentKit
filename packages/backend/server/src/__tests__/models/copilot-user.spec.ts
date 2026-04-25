import { PrismaClient, User } from '@prisma/client';
import ava, { TestFn } from 'ava';

import { Config } from '../../base';
import {
  CopilotContextModel,
  CopilotSessionModel,
  CopilotUserConfigModel,
} from '../../models';
import { UserModel } from '../../models/user';
import { createTestingModule, type TestingModule } from '../utils';
import { cleanObject } from '../utils/copilot';

interface Context {
  config: Config;
  module: TestingModule;
  db: PrismaClient;
  user: UserModel;
  copilotContext: CopilotContextModel;
  copilotSession: CopilotSessionModel;
  copilotUser: CopilotUserConfigModel;
}

const test = ava as TestFn<Context>;

test.before(async t => {
  const module = await createTestingModule();
  t.context.user = module.get(UserModel);
  t.context.copilotContext = module.get(CopilotContextModel);
  t.context.copilotSession = module.get(CopilotSessionModel);
  t.context.copilotUser = module.get(CopilotUserConfigModel);
  t.context.db = module.get(PrismaClient);
  t.context.config = module.get(Config);
  t.context.module = module;
});

let user: User;

test.beforeEach(async t => {
  await t.context.module.initTestingDB();
  await t.context.copilotSession.createPrompt('prompt-name', 'gpt-4.1');
  user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
});

test.after(async t => {
  await t.context.module.close();
});

test('should insert and search embedding', async t => {
  const { copilotUser, copilotSession } = t.context;

  {
    const { fileId } = await copilotUser.addFile(user.id, {
      fileName: 'file1',
      blobId: 'blob1',
      mimeType: 'text/plain',
      size: 1,
      metadata: '',
    });
    await copilotUser.insertFileEmbeddings(user.id, fileId, [
      {
        index: 0,
        content: 'content',
        embedding: Array.from({ length: 1024 }, () => 1),
      },
    ]);

    {
      const ret = await copilotUser.matchFileEmbedding(
        Array.from({ length: 1024 }, () => 0.9),
        user.id,
        1,
        1
      );
      t.snapshot(
        cleanObject(ret, ['fileId']),
        'should match workspace file embedding'
      );
    }
  }

  // doc embedding
  {
    const sessionId = await copilotSession.create({
      sessionId: 'session1',
      userId: user.id,
      title: 'title',
      promptName: 'prompt-name',
      promptAction: null,
      metadata: '',
    });
    const { docId } = await copilotUser.addDoc(user.id, sessionId, {
      title: 'title',
      content: 'content',
    });
    await copilotUser.insertDocEmbedding(user.id, docId, [
      {
        index: 0,
        content: 'doc content',
        embedding: Array.from({ length: 1024 }, () => 1),
      },
    ]);

    {
      await copilotUser.updateDoc(user.id, docId, {
        title: 'updated title',
        content: 'updated content',
      });

      const ret = await copilotUser.getDoc(user.id, docId);
      t.snapshot(
        cleanObject(
          [ret],
          ['userId', 'docId', 'metadata', 'createdAt', 'updatedAt']
        ),
        'should get doc metadata'
      );
    }

    {
      const ret = await copilotUser.matchDocEmbedding(
        Array.from({ length: 1024 }, () => 0.9),
        user.id,
        1,
        1
      );
      t.snapshot(
        cleanObject(ret, ['docId', 'distance']),
        'should match doc embedding'
      );
    }

    {
      await copilotUser.removeDoc(user.id, docId);
      const ret = await copilotUser.matchDocEmbedding(
        Array.from({ length: 1024 }, () => 0.9),
        user.id,
        1,
        1
      );
      t.snapshot(ret, 'should return empty array when embedding is deleted');
    }
  }

  // chat embedding
  {
    const sessionId = await copilotSession.create({
      sessionId: 'session2',
      userId: user.id,
      title: 'title',
      promptName: 'prompt-name',
      promptAction: null,
      metadata: '',
    });
    await copilotUser.insertChatEmbeddings(user.id, sessionId, [
      {
        index: 0,
        content: 'chat content',
        embedding: Array.from({ length: 1024 }, () => 1),
      },
    ]);

    {
      const ret = await copilotUser.matchChatEmbedding(
        Array.from({ length: 1024 }, () => 0.9),
        user.id,
        1,
        1
      );
      t.snapshot(
        cleanObject(ret, ['sessionId', 'distance']),
        'should match chat embedding'
      );
    }
  }
});
