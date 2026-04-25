import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AiPromptRole, Prisma } from '@prisma/client';
import { omit } from 'lodash-es';

import {
  CopilotSessionDeleted,
  CopilotSessionInvalidInput,
  CopilotSessionNotFound,
} from '../base';
import { getTokenEncoder } from '../native';
import { BaseModel } from './base';

export enum SessionType {
  User = 'user', // pinned is false
  Pinned = 'pinned', // pinned is true
}

type ChatPrompt = {
  name: string;
  action?: string | null;
  model: string;
};

type ChatAttachment = { attachment: string; mimeType: string } | string;

type ChatStreamObject = {
  type:
    | 'text-delta'
    | 'reasoning'
    | 'tool-call'
    | 'tool-result'
    | 'tool-incomplete-result'
    | 'status';
  textDelta?: string;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, any>;
  result?: any;
};

type ChatMessage = {
  id?: string | undefined;
  role: 'system' | 'assistant' | 'user';
  content: string;
  attachments?: ChatAttachment[] | null;
  params?: Record<string, any> | null;
  streamObjects?: ChatStreamObject[] | null;
  createdAt: Date;
};

type PureChatSession = {
  sessionId: string;
  docId?: string;
  pinned?: boolean;
  title: string | null;
  messages?: ChatMessage[];
  metadata: string;
  // connect ids
  userId: string;
};

type ChatSession = PureChatSession & {
  // connect ids
  promptName: string;
  promptAction: string | null;
};

type ChatSessionWithPrompt = PureChatSession & {
  prompt: ChatPrompt;
};

type ChatSessionBaseState = Pick<ChatSession, 'userId' | 'sessionId'>;

type UpdateChatSessionMessage = ChatSessionBaseState & {
  prompt: { model: string };
  messages: ChatMessage[];
};

export type UpdateChatSessionOptions = ChatSessionBaseState &
  Pick<Partial<ChatSession>, 'pinned' | 'promptName' | 'title' | 'metadata'>;

export type UpdateChatSession = ChatSessionBaseState & UpdateChatSessionOptions;

export type ListSessionOptions = Pick<
  Partial<ChatSession>,
  'sessionId' | 'pinned'
> & {
  userId: string | undefined;
  action?: boolean;
  limit?: number;
  skip?: number;
  sessionOrder?: 'asc' | 'desc';
  messageOrder?: 'asc' | 'desc';

  // extra condition
  withPrompt?: boolean;
  withMessages?: boolean;
};

export type CleanupSessionOptions = Pick<ChatSession, 'userId'> & {
  sessionIds: string[];
};

@Injectable()
export class CopilotSessionModel extends BaseModel {
  getSessionType(session: Pick<ChatSession, 'pinned'>): SessionType {
    if (session.pinned) return SessionType.Pinned;
    return SessionType.User;
  }
  // NOTE: just for test, remove it after copilot prompt model is ready
  async createPrompt(name: string, model: string, action?: string) {
    await this.db.aiPrompt.create({
      data: { name, model, action: action ?? null },
    });
  }

  @Transactional()
  async create(state: ChatSession, reuseChat = false): Promise<string> {
    // find and return existing session if session is chat session
    if (reuseChat && !state.promptAction) {
      const sessionId = await this.find(state);
      if (sessionId) return sessionId;
    }

    if (state.pinned) {
      await this.unpin(state.userId);
    }

    const session = await this.db.aiSession.create({
      data: {
        id: state.sessionId,
        pinned: state.pinned ?? false,
        // connect
        userId: state.userId,
        promptName: state.promptName,
        promptAction: state.promptAction,
        metadata: '',
      },
      select: { id: true },
    });
    return session.id;
  }

  @Transactional()
  async createWithPrompt(
    state: ChatSessionWithPrompt,
    reuseChat = false
  ): Promise<string> {
    const { prompt, ...rest } = state;
    return await this.models.copilotSession.create(
      { ...rest, promptName: prompt.name, promptAction: prompt.action ?? null },
      reuseChat
    );
  }

  @Transactional()
  async has(
    sessionId: string,
    userId: string,
    params?: Prisma.AiSessionCountArgs['where']
  ) {
    return await this.db.aiSession
      .count({ where: { id: sessionId, userId, ...params } })
      .then(c => c > 0);
  }

  @Transactional()
  async find(state: PureChatSession) {
    const session = await this.db.aiSession.findFirst({
      where: {
        userId: state.userId,
        prompt: { action: { equals: null } },
      },
      select: { id: true, deletedAt: true },
    });
    if (session?.deletedAt) throw new CopilotSessionDeleted();
    return session?.id;
  }

  @Transactional()
  async getExists<Select extends Prisma.AiSessionSelect>(
    sessionId: string,
    select?: Select,
    where?: Omit<Prisma.AiSessionWhereInput, 'id' | 'deletedAt'>
  ) {
    return (await this.db.aiSession.findUnique({
      where: { ...where, id: sessionId, deletedAt: null },
      select,
    })) as Prisma.AiSessionGetPayload<{ select: Select }> | null;
  }

  @Transactional()
  async get(sessionId: string) {
    return await this.getExists(sessionId, {
      id: true,
      userId: true,
      pinned: true,
      title: true,
      metadata: true,
      promptName: true,
      tokenCost: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        select: {
          id: true,
          role: true,
          content: true,
          attachments: true,
          streamObjects: true,
          params: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    });
  }

  private getListConditions(
    options: ListSessionOptions
  ): Prisma.AiSessionWhereInput {
    const { userId, sessionId, action } = options;

    function getNullCond<T>(
      maybeBool: boolean | undefined,
      wrap: (ret: { not: null } | null) => T = ret => ret as T
    ): T | undefined {
      return maybeBool === true
        ? wrap({ not: null })
        : maybeBool === false
          ? wrap(null)
          : undefined;
    }

    function getEqCond<T>(maybeValue: T | undefined): T | undefined {
      return maybeValue !== undefined ? maybeValue : undefined;
    }

    const conditions: Prisma.AiSessionWhereInput['OR'] = [
      {
        userId,
        id: getEqCond(sessionId),
        deletedAt: null,
        pinned: getEqCond(options.pinned),
        prompt: getNullCond(action, ret => ({ action: ret })),
      },
    ];

    return { OR: conditions };
  }

  async count(options: ListSessionOptions) {
    return await this.db.aiSession.count({
      where: this.getListConditions(options),
    });
  }

  async list(options: ListSessionOptions) {
    return await this.db.aiSession.findMany({
      where: this.getListConditions(options),
      select: {
        id: true,
        userId: true,
        pinned: true,
        title: true,
        metadata: true,
        promptName: true,
        tokenCost: true,
        createdAt: true,
        updatedAt: true,
        messages: options.withMessages
          ? {
              select: {
                id: true,
                role: true,
                content: true,
                attachments: true,
                streamObjects: true,
                params: true,
                createdAt: true,
              },
              orderBy: {
                // message order is asc by default
                createdAt: options?.messageOrder === 'desc' ? 'desc' : 'asc',
              },
            }
          : false,
      },
      take: options?.limit,
      skip: options?.skip,
      orderBy: {
        updatedAt: options?.sessionOrder === 'asc' ? 'asc' : 'desc',
      },
    });
  }

  @Transactional()
  async unpin(userId: string): Promise<boolean> {
    const { count } = await this.db.aiSession.updateMany({
      where: { userId, pinned: true, deletedAt: null },
      data: { pinned: false },
    });

    return count > 0;
  }

  @Transactional()
  async update(options: UpdateChatSessionOptions): Promise<string> {
    const { userId, sessionId, promptName, pinned, title, metadata } = options;
    const session = await this.getExists(
      sessionId,
      {
        id: true,
        pinned: true,
        prompt: true,
      },
      { userId }
    );
    if (!session) {
      throw new CopilotSessionNotFound();
    }

    // not allow to update action session
    if (session.prompt.action) {
      throw new CopilotSessionInvalidInput(
        `Cannot update action: ${session.id}`
      );
    }

    if (promptName) {
      const prompt = await this.db.aiPrompt.findFirst({
        where: { name: promptName },
      });
      // always not allow to update to action prompt
      if (!prompt || prompt.action) {
        throw new CopilotSessionInvalidInput(
          `Prompt ${promptName} not found or not available for session ${sessionId}`
        );
      }
    }
    if (pinned && pinned !== session.pinned) {
      // if pin the session, unpin exists session in the workspace
      await this.unpin(userId);
    }

    await this.db.aiSession.update({
      where: { id: sessionId },
      data: { promptName, pinned, title, metadata },
    });

    return sessionId;
  }

  @Transactional()
  async cleanup(options: CleanupSessionOptions): Promise<string[]> {
    const sessions = await this.db.aiSession.findMany({
      where: {
        id: { in: options.sessionIds },
        userId: options.userId,
        deletedAt: null,
      },
      select: { id: true, prompt: true },
    });
    const sessionIds = sessions.map(({ id }) => id);
    // cleanup all messages
    await this.db.aiSessionMessage.deleteMany({
      where: { sessionId: { in: sessionIds } },
    });

    await this.db.aiSession.updateMany({
      where: { id: { in: sessionIds } },
      data: { pinned: false, deletedAt: new Date() },
    });

    return sessionIds;
  }

  @Transactional()
  async getMessages(
    sessionId: string,
    select?: Prisma.AiSessionMessageSelect,
    orderBy?: Prisma.AiSessionMessageOrderByWithRelationInput
  ) {
    return this.db.aiSessionMessage.findMany({
      where: { sessionId },
      select,
      orderBy: orderBy ?? { createdAt: 'asc' },
    });
  }

  private calculateTokenSize(messages: any[], model: string): number {
    const encoder = getTokenEncoder(model);
    const content = messages.map(m => m.content).join('');
    return encoder?.count(content) || 0;
  }

  @Transactional()
  async updateMessages(state: UpdateChatSessionMessage) {
    const { sessionId, userId, messages } = state;
    const haveSession = await this.has(sessionId, userId);
    if (!haveSession) {
      throw new CopilotSessionNotFound();
    }

    if (messages.length) {
      const tokenCost = this.calculateTokenSize(messages, state.prompt.model);
      await this.db.aiSessionMessage.createMany({
        data: messages.map(m => ({
          ...m,
          attachments: m.attachments || undefined,
          params: omit(m.params, ['docs']) || undefined,
          streamObjects: m.streamObjects || undefined,
          sessionId,
        })),
      });

      // only count message generated by user
      const userMessages = messages.filter(m => m.role === 'user');
      await this.db.aiSession.update({
        where: { id: sessionId },
        data: {
          messageCost: { increment: userMessages.length },
          tokenCost: { increment: tokenCost },
        },
      });
    }
  }

  @Transactional()
  async revertLatestMessage(
    sessionId: string,
    removeLatestUserMessage: boolean
  ) {
    const id = await this.getExists(sessionId, { id: true }).then(
      session => session?.id
    );
    if (!id) {
      throw new CopilotSessionNotFound();
    }
    const messages = await this.getMessages(id, { id: true, role: true });
    const ids = messages
      .slice(
        messages.findLastIndex(({ role }) => role === AiPromptRole.user) +
          (removeLatestUserMessage ? 0 : 1)
      )
      .map(({ id }) => id);

    if (ids.length) {
      await this.db.aiSessionMessage.deleteMany({ where: { id: { in: ids } } });

      // clear the title if there only one round of conversation left
      const remainingMessages = await this.getMessages(id, { role: true });
      const userMessageCount = remainingMessages.filter(
        m => m.role === AiPromptRole.user
      ).length;

      if (userMessageCount <= 1) {
        await this.db.aiSession.update({
          where: { id },
          data: { title: null },
        });
      }
    }
  }

  @Transactional()
  async countUserMessages(userId: string): Promise<number> {
    const sessions = await this.db.aiSession.findMany({
      where: { userId },
      select: { messageCost: true, prompt: { select: { action: true } } },
    });
    return sessions
      .map(({ messageCost, prompt: { action } }) => (action ? 1 : messageCost))
      .reduce((prev, cost) => prev + cost, 0);
  }

  @Transactional()
  async cleanupEmptySessions(earlyThen: Date) {
    // delete never used sessions
    const { count: removed } = await this.db.aiSession.deleteMany({
      where: {
        messageCost: 0,
        deletedAt: null,
        // filter session updated more than 24 hours ago
        updatedAt: { lt: earlyThen },
      },
    });

    // mark empty sessions as deleted
    const { count: cleaned } = await this.db.aiSession.updateMany({
      where: {
        deletedAt: null,
        messages: { none: {} },
        // filter session updated more than 24 hours ago
        updatedAt: { lt: earlyThen },
      },
      data: {
        deletedAt: new Date(),
        pinned: false,
      },
    });

    return { removed, cleaned };
  }

  @Transactional()
  async toBeGenerateTitle() {
    const sessions = await this.db.aiSession
      .findMany({
        where: {
          title: null,
          deletedAt: null,
          messages: { some: {} },
          // only generate titles for non-actions sessions
          prompt: { action: null },
        },
        select: {
          id: true,
          // count assistant messages
          _count: { select: { messages: { where: { role: 'assistant' } } } },
        },
        orderBy: { updatedAt: 'desc' },
      })
      .then(s => s.filter(s => s._count.messages > 0));

    return sessions;
  }
}
