import { randomUUID } from 'node:crypto';

import { PrismaClient, User } from '@prisma/client';
import ava, { ExecutionContext, TestFn } from 'ava';

import { CopilotSessionInvalidInput } from '../../base';
import {
  CopilotSessionModel,
  UpdateChatSessionOptions,
  UserModel,
} from '../../models';
import { createTestingModule, type TestingModule } from '../utils';

interface Context {
  module: TestingModule;
  db: PrismaClient;
  user: UserModel;
  copilotSession: CopilotSessionModel;
}

const test = ava as TestFn<Context>;

test.before(async t => {
  const module = await createTestingModule();
  t.context.user = module.get(UserModel);
  t.context.copilotSession = module.get(CopilotSessionModel);
  t.context.db = module.get(PrismaClient);
  t.context.module = module;
});

let user: User;

test.beforeEach(async t => {
  await t.context.module.initTestingDB();
  user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
});

test.after(async t => {
  await t.context.module.close();
});

// Test data constants
const TEST_PROMPTS = {
  NORMAL: 'test-prompt',
  ACTION: 'action-prompt',
} as const;

// Helper functions
const createTestPrompts = async (
  copilotSession: CopilotSessionModel,
  db: PrismaClient
) => {
  await copilotSession.createPrompt(TEST_PROMPTS.NORMAL, 'gpt-5-mini');
  await db.aiPrompt.create({
    data: { name: TEST_PROMPTS.ACTION, model: 'gpt-5-mini', action: 'edit' },
  });
};

const createTestSession = async (
  t: ExecutionContext<Context>,
  overrides: Partial<{
    sessionId: string;
    userId: string;
    pinned: boolean;
    promptName: string;
    promptAction: string | null;
  }> = {}
) => {
  const sessionData = {
    sessionId: randomUUID(),
    userId: user.id,
    pinned: false,
    title: null,
    promptName: TEST_PROMPTS.NORMAL,
    promptAction: null,
    metadata: '',
    ...overrides,
  };

  await t.context.copilotSession.create(sessionData);
  return sessionData;
};

const getSessionStates = async (db: PrismaClient, sessionIds: string[]) => {
  const sessions = await Promise.all(
    sessionIds.map(id =>
      db.aiSession.findUnique({
        where: { id },
        select: { id: true, pinned: true },
      })
    )
  );
  return sessions;
};

const addMessagesToSession = async (
  copilotSession: CopilotSessionModel,
  sessionId: string,
  content: string,
  delayMs: number = 0
) => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  await copilotSession.updateMessages({
    sessionId,
    userId: user.id,
    prompt: { model: 'gpt-5-mini' },
    messages: [
      {
        role: 'user',
        content,
        createdAt: new Date(),
      },
    ],
  });
};

const createSessionWithMessages = async (
  t: ExecutionContext<Context>,
  overrides: Parameters<typeof createTestSession>[1] = {},
  messageContent?: string,
  delayMs: number = 0
) => {
  const sessionData = await createTestSession(t, overrides);
  if (messageContent) {
    await addMessagesToSession(
      t.context.copilotSession,
      sessionData.sessionId,
      messageContent,
      delayMs
    );
  }
  return sessionData;
};

// Simplified update assertion helpers
type UpdateData = Omit<UpdateChatSessionOptions, 'userId' | 'sessionId'>;

test('should pin and unpin sessions', async t => {
  const { copilotSession, db } = t.context;

  await createTestPrompts(copilotSession, db);

  const firstSessionId = 'first-session-id';
  const secondSessionId = 'second-session-id';
  const thirdSessionId = 'third-session-id';

  // should unpin existing pinned session when creating a new one
  {
    await copilotSession.create({
      sessionId: firstSessionId,
      userId: user.id,
      promptName: 'test-prompt',
      promptAction: null,
      pinned: true,
      title: null,
      metadata: '',
    });

    const firstSession = await copilotSession.get(firstSessionId);
    t.truthy(firstSession, 'first session should be created successfully');
    t.is(firstSession?.pinned, true, 'first session should be pinned');

    // should unpin the first one when creating second pinned session
    await copilotSession.create({
      sessionId: secondSessionId,
      userId: user.id,
      promptName: 'test-prompt',
      promptAction: null,
      pinned: true,
      title: null,
      metadata: '',
    });

    const sessionStatesAfterSecondPin = await getSessionStates(db, [
      firstSessionId,
      secondSessionId,
    ]);

    t.snapshot(
      sessionStatesAfterSecondPin,
      'session states after creating second pinned session'
    );
  }

  // should can unpin a pinned session
  {
    await createTestSession(t, { sessionId: thirdSessionId, pinned: true });
    const unpinResult = await copilotSession.unpin(user.id);
    t.is(
      unpinResult,
      true,
      'unpin operation should return true when sessions are unpinned'
    );

    const unpinResultAgain = await copilotSession.unpin(user.id);
    t.snapshot(
      unpinResultAgain,
      'should return false when no sessions to unpin'
    );
  }

  // should unpin all sessions
  {
    const allSessionsAfterUnpin = await db.aiSession.findMany({
      where: { id: { in: [firstSessionId, secondSessionId, thirdSessionId] } },
      select: { pinned: true, id: true },
      orderBy: { id: 'asc' },
    });

    t.snapshot(
      allSessionsAfterUnpin,
      'all sessions should be unpinned after unpin operation'
    );
  }
});

test('should handle session updates and type conversions', async t => {
  const { copilotSession, db } = t.context;
  await createTestPrompts(copilotSession, db);

  const sessionId = randomUUID();
  const actionSessionId = randomUUID();

  {
    await createTestSession(t, { sessionId });
    await createTestSession(t, {
      sessionId: actionSessionId,
      promptName: TEST_PROMPTS.ACTION,
      promptAction: 'edit',
    });
  }

  const updateTestCases = [
    // action sessions should reject all updates
    {
      sessionId: actionSessionId,
      updates: [
        { pinned: true, expected: 'reject' },
        { promptName: TEST_PROMPTS.NORMAL, expected: 'reject' },
      ],
    },
    // Regular sessions - prompt validation
    {
      sessionId,
      updates: [
        { promptName: TEST_PROMPTS.NORMAL, expected: 'allow' },
        { promptName: TEST_PROMPTS.ACTION, expected: 'reject' },
        { promptName: 'non-existent-prompt', expected: 'reject' },
      ],
    },
  ];

  const updateResults = [];
  for (const { sessionId: testSessionId, updates } of updateTestCases) {
    for (const update of updates) {
      const { expected: _, ...updateData } = update;
      try {
        await t.context.copilotSession.update({
          ...updateData,
          userId: user.id,
          sessionId: testSessionId,
        });
        updateResults.push({
          sessionType: testSessionId === actionSessionId ? 'action' : 'regular',
          update: updateData,
          result: 'success',
        });
      } catch (error) {
        updateResults.push({
          sessionType: testSessionId === actionSessionId ? 'action' : 'regular',
          update: updateData,
          result:
            error instanceof CopilotSessionInvalidInput ? 'rejected' : 'error',
        });
      }
    }
  }

  t.snapshot(updateResults, 'session update validation results');

  // session type conversions
  const existingPinnedId = randomUUID();
  await createTestSession(t, { sessionId: existingPinnedId, pinned: true });

  await copilotSession.update({ userId: user.id, sessionId, pinned: true });

  // pinning behavior
  const states = await getSessionStates(db, [sessionId, existingPinnedId]);
  const pinnedCount = states.filter(s => s?.pinned).length;
  const unpinnedCount = states.filter(s => s && !s.pinned).length;

  t.snapshot(
    {
      totalSessions: states.length,
      pinnedSessions: pinnedCount,
      unpinnedSessions: unpinnedCount,
      onlyOneSessionPinned: pinnedCount === 1,
    },
    'pinning behavior - should unpin existing when pinning new'
  );

  // type conversions
  const conversionSteps = [];
  const conversions: Array<[string, UpdateData]> = [
    ['pinned_to_workspace', { pinned: false }],
    ['workspace_to_pinned', { pinned: true }],
  ];

  for (const [step, data] of conversions) {
    await copilotSession.update({ userId: user.id, sessionId, ...data });
    const session = await db.aiSession.findUnique({
      where: { id: sessionId },
      select: { pinned: true },
    });
    conversionSteps.push({
      step,
      sessionState: {
        pinned: !!session?.pinned,
      },
      type: copilotSession.getSessionType(session!),
    });
  }

  t.snapshot(conversionSteps, 'session type conversion steps');
});

test('should handle session queries, ordering, and filtering', async t => {
  const { copilotSession, db } = t.context;
  await createTestPrompts(copilotSession, db);

  const sessionIds: string[] = [];
  const sessionConfigs = [
    { type: 'user', config: { pinned: false } },
    { type: 'pinned', config: { pinned: true }, withMessages: true },
    {
      type: 'action',
      config: { promptName: TEST_PROMPTS.ACTION, promptAction: 'edit' },
    },
  ];

  // create sessions with timing delays for ordering tests
  for (let i = 0; i < sessionConfigs.length; i++) {
    const { config, withMessages } = sessionConfigs[i];
    const sessionId = randomUUID();
    sessionIds.push(sessionId);

    if (withMessages) {
      await createSessionWithMessages(
        t,
        { sessionId, ...config },
        `Message for session ${i}`,
        100 * i
      );
    } else {
      await createTestSession(t, { sessionId, ...config });
    }
  }

  // Create additional doc sessions for multiple doc test
  for (let i = 0; i < 2; i++) {
    const sessionId = randomUUID();
    sessionIds.push(sessionId);
    await createSessionWithMessages(
      t,
      { sessionId },
      `Additional doc message ${i}`,
      200 + 100 * i
    );
  }

  const baseParams = { userId: user.id };
  const docParams = { ...baseParams };
  const queryTestCases = [
    { name: 'all_workspace_sessions', params: baseParams },
    {
      name: 'user_sessions_with_messages',
      params: { ...baseParams, withMessages: true },
    },
    {
      name: 'recent_top3_sessions',
      params: { ...baseParams, limit: 3, sessionOrder: 'desc' as const },
    },
    {
      name: 'non_action_sessions',
      params: { ...docParams, action: false },
    },
    { name: 'non_fork_sessions', params: { ...docParams, fork: false } },
    {
      name: 'latest_valid_session',
      params: {
        ...docParams,
        limit: 1,
        sessionOrder: 'desc' as const,
        action: false,
        fork: false,
      },
    },
  ];

  const queryResults: Record<string, any> = {};
  for (const { name, params } of queryTestCases) {
    const sessions = await copilotSession.list(params);
    queryResults[name] = {
      count: sessions.length,
      sessionTypes: sessions.map(s => ({
        type: copilotSession.getSessionType(s),
        hasMessages: !!s.messages?.length,
        messageCount: s.messages?.length || 0,
        isAction: s.promptName === TEST_PROMPTS.ACTION,
      })),
    };
  }

  t.snapshot(queryResults, 'comprehensive session query results');

  // should list sessions appear in correct order
  {
    const docSessionsWithMessages = await copilotSession.list({
      userId: user.id,
      withMessages: true,
      sessionOrder: 'desc',
    });

    // check sessions are returned in desc order by updatedAt
    if (docSessionsWithMessages.length > 1) {
      for (let i = 1; i < docSessionsWithMessages.length; i++) {
        const currentSession = docSessionsWithMessages[i - 1];
        const nextSession = docSessionsWithMessages[i];
        t.true(
          currentSession.updatedAt >= nextSession.updatedAt,
          `sessions should be ordered by updatedAt desc: ${currentSession.updatedAt} >= ${nextSession.updatedAt}`
        );
      }
    }
  }

  // should update `updatedAt` when updating messages
  {
    const oldestDocSession = await copilotSession.list({
      userId: user.id,
      sessionOrder: 'asc',
      limit: 1,
    });

    if (oldestDocSession.length > 0) {
      const sessionId = oldestDocSession[0].id;

      // get initial updatedAt
      const sessionBeforeUpdate = await db.aiSession.findUnique({
        where: { id: sessionId },
        select: { updatedAt: true },
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      await addMessagesToSession(
        copilotSession,
        sessionId,
        'Update to verify sorting'
      );

      const sessionAfterUpdate = await db.aiSession.findUnique({
        where: { id: sessionId },
        select: { updatedAt: true },
      });
      t.true(
        sessionAfterUpdate!.updatedAt > sessionBeforeUpdate!.updatedAt,
        'updatedAt should be updated after adding messages'
      );

      // the updated session now should appears first in desc order
      const sessionsAfterUpdate = await copilotSession.list({
        userId: user.id,
        sessionOrder: 'desc',
      });
      t.is(
        sessionsAfterUpdate[0].id,
        sessionId,
        'session with updated messages should appear first in descending order'
      );
    }
  }

  // should get latest valid session
  {
    const latestValidSessions = await copilotSession.list({
      userId: user.id,
      limit: 1,
      sessionOrder: 'desc',
      action: false,
    });

    if (latestValidSessions.length > 0) {
      const latestSession = latestValidSessions[0];

      // verify this is indeed a non-action
      t.not(
        latestSession.promptName,
        TEST_PROMPTS.ACTION,
        'latest session should not use action prompt'
      );

      // verify it's the most recently updated among valid sessions
      const allValidSessions = await copilotSession.list({
        userId: user.id,
        action: false,
        sessionOrder: 'desc',
      });

      if (allValidSessions.length > 0) {
        t.is(
          allValidSessions[0].id,
          latestSession.id,
          'latest valid session should be the first in the ordered list'
        );
      }
    }
  }
});

test('should cleanup empty sessions correctly', async t => {
  const { copilotSession, db } = t.context;
  await createTestPrompts(copilotSession, db);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // should be deleted
  const neverUsedSessionIds: string[] = [randomUUID(), randomUUID()];
  await Promise.all(
    neverUsedSessionIds.map(async id => {
      await createTestSession(t, { sessionId: id });
      await db.aiSession.update({
        where: { id },
        data: { messageCost: 0, updatedAt: oneDayAgo },
      });
    })
  );

  // should be marked as deleted
  const emptySessionIds: string[] = [randomUUID(), randomUUID()];
  await Promise.all(
    emptySessionIds.map(async id => {
      await createTestSession(t, { sessionId: id });
      await db.aiSession.update({
        where: { id },
        data: { messageCost: 100, updatedAt: oneDayAgo },
      });
    })
  );

  // should not be affected
  const recentSessionId = randomUUID();
  await createTestSession(t, { sessionId: recentSessionId });
  await db.aiSession.update({
    where: { id: recentSessionId },
    data: { messageCost: 0, updatedAt: twoHoursAgo },
  });

  // Create session with messages (should not be affected)
  const sessionWithMsgId = randomUUID();
  await createSessionWithMessages(
    t,
    { sessionId: sessionWithMsgId },
    'test message'
  );

  const result = await copilotSession.cleanupEmptySessions(oneDayAgo);

  const remainingSessions = await db.aiSession.findMany({
    where: {
      id: {
        in: [
          ...neverUsedSessionIds,
          ...emptySessionIds,
          recentSessionId,
          sessionWithMsgId,
        ],
      },
    },
    select: { id: true, deletedAt: true, pinned: true },
  });

  t.snapshot(
    {
      cleanupResult: result,
      remainingSessions: remainingSessions.map(s => ({
        deleted: !!s.deletedAt,
        pinned: s.pinned,
        type: neverUsedSessionIds.includes(s.id)
          ? 'zeroCost'
          : emptySessionIds.includes(s.id)
            ? 'noMessages'
            : s.id === recentSessionId
              ? 'recent'
              : 'withMessages',
      })),
    },
    'cleanup empty sessions results'
  );
});

test('should get sessions for title generation correctly', async t => {
  const { copilotSession, db } = t.context;
  await createTestPrompts(copilotSession, db);

  // create valid sessions with messages
  const sessionIds: string[] = [randomUUID(), randomUUID()];
  await Promise.all(
    sessionIds.map(async (id, index) => {
      await createTestSession(t, { sessionId: id });
      await db.aiSession.update({
        where: { id },
        data: {
          updatedAt: new Date(Date.now() - index * 1000),
          messages: {
            create: Array.from({ length: index + 1 }, (_, i) => ({
              role: 'assistant',
              content: `assistant message ${i}`,
            })),
          },
        },
      });
    })
  );

  // create excluded sessions
  const excludedSessions = [
    {
      reason: 'hasTitle',
      setupFn: async (id: string) => {
        await createTestSession(t, { sessionId: id });
        await db.aiSession.update({
          where: { id },
          data: { title: 'Existing Title' },
        });
      },
    },
    {
      reason: 'isDeleted',
      setupFn: async (id: string) => {
        await createTestSession(t, { sessionId: id });
        await db.aiSession.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      },
    },
    {
      reason: 'noMessages',
      setupFn: async (id: string) => {
        await createTestSession(t, { sessionId: id });
      },
    },
    {
      reason: 'isAction',
      setupFn: async (id: string) => {
        await createTestSession(t, {
          sessionId: id,
          promptName: TEST_PROMPTS.ACTION,
        });
      },
    },
    {
      reason: 'noAssistantMessages',
      setupFn: async (id: string) => {
        await createTestSession(t, { sessionId: id });
        await db.aiSessionMessage.create({
          data: { sessionId: id, role: 'user', content: 'User message only' },
        });
      },
    },
  ];

  await Promise.all(
    excludedSessions.map(async session => {
      await session.setupFn(randomUUID());
    })
  );

  const result = await copilotSession.toBeGenerateTitle();

  t.snapshot(
    {
      total: result.length,
      sessions: result.map(s => ({
        assistantMessageCount: s._count.messages,
        isValid: sessionIds.includes(s.id),
      })),
      onlyValidSessionsReturned: result.every(s => sessionIds.includes(s.id)),
    },
    'sessions for title generation results'
  );
});
