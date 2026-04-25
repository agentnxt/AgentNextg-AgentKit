import {
  Args,
  Context,
  Field,
  ID,
  Mutation,
  ObjectType,
  Parent,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { Request } from 'express';
import { SafeIntResolver } from 'graphql-scalars';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

import {
  BlobNotFound,
  BlobQuotaExceeded,
  CallMetric,
  CopilotFailedToModifyContext,
  CopilotInvalidContext,
  CopilotSessionNotFound,
  type FileUpload,
  RequestMutex,
  Throttle,
  TooManyRequest,
  UserFriendlyError,
} from '../../../base';
import { CurrentUser } from '../../../core/auth';
import {
  ArtifactEmbedStatus,
  ContextChatOrDoc,
  ContextFile,
  Models,
} from '../../../models';
import { COPILOT_LOCKER, CopilotType } from '../resolver';
import { ChatSessionService } from '../session';
import { MAX_EMBEDDABLE_SIZE } from '../types';
import { CopilotUserService } from '../workspace';
import { CopilotContextService } from './service';

@ObjectType('CopilotContext')
export class CopilotContextType {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID, { nullable: true })
  id!: string | undefined;
}

registerEnumType(ArtifactEmbedStatus, { name: 'ContextEmbedStatus' });

@ObjectType()
class CopilotContextChatOrDoc implements ContextChatOrDoc {
  @Field(() => ID)
  id!: string;

  @Field(() => SafeIntResolver)
  chunkSize!: number;

  @Field(() => ArtifactEmbedStatus)
  status!: ArtifactEmbedStatus;

  @Field(() => String, { nullable: true })
  error!: string | null;

  @Field(() => SafeIntResolver)
  createdAt!: number;
}

@ObjectType()
class CopilotContextFile implements ContextFile {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  mimeType!: string;

  @Field(() => SafeIntResolver)
  chunkSize!: number;

  @Field(() => ArtifactEmbedStatus)
  status!: ArtifactEmbedStatus;

  @Field(() => String, { nullable: true })
  error!: string | null;

  @Field(() => String)
  blobId!: string;

  @Field(() => SafeIntResolver)
  createdAt!: number;
}

@ObjectType()
class ContextUserEmbeddingStatus {
  @Field(() => SafeIntResolver)
  total!: number;

  @Field(() => SafeIntResolver)
  embedded!: number;
}

@Throttle()
@Resolver(() => CopilotType)
export class CopilotContextRootResolver {
  constructor(
    private readonly mutex: RequestMutex,
    private readonly chatSession: ChatSessionService,
    private readonly context: CopilotContextService,
    private readonly models: Models
  ) {}

  private async checkChatSession(
    user: CurrentUser,
    sessionId: string
  ): Promise<void> {
    const session = await this.chatSession.get(sessionId);
    if (!session || session.config.userId !== user.id) {
      throw new CopilotSessionNotFound();
    }
  }

  @ResolveField(() => [CopilotContextType], {
    description: 'Get the context list of a session',
    complexity: 2,
  })
  @CallMetric('ai', 'context_create')
  async contexts(
    @Parent() _copilot: CopilotType,
    @CurrentUser() user: CurrentUser,
    @Args('sessionId', { nullable: true }) sessionId?: string,
    @Args('contextId', { nullable: true }) contextId?: string
  ): Promise<CopilotContextType[]> {
    if (sessionId || contextId) {
      const lockFlag = `${COPILOT_LOCKER}:context:${sessionId || contextId}`;
      await using lock = await this.mutex.acquire(lockFlag);
      if (!lock) {
        throw new TooManyRequest('Server is busy');
      }

      if (contextId) {
        const context = await this.context.get(contextId);
        if (context) return [context];
      } else if (sessionId) {
        await this.checkChatSession(user, sessionId);
        const context = await this.context.getBySessionId(sessionId);
        if (context) return [context];
      }
    }

    return [{ userId: user.id, id: undefined }];
  }

  @Mutation(() => String, {
    description: 'Create a context session',
  })
  @CallMetric('ai', 'context_create')
  async createCopilotContext(
    @CurrentUser() user: CurrentUser,
    @Args('sessionId') sessionId: string
  ): Promise<string> {
    const lockFlag = `${COPILOT_LOCKER}:context:${sessionId}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }
    await this.checkChatSession(user, sessionId);

    const context = await this.context.create(sessionId);
    return context.id;
  }

  @ResolveField(() => ContextUserEmbeddingStatus, {
    description: 'query user embedding status',
  })
  @CallMetric('ai', 'context_query_user_embedding_status')
  async embeddingStatus(
    @CurrentUser() user: CurrentUser
  ): Promise<ContextUserEmbeddingStatus> {
    const { total, embedded } =
      await this.models.copilotUser.getUserEmbeddingStatus(user.id);
    return { total, embedded };
  }
}

@Throttle()
@Resolver(() => CopilotContextType)
export class CopilotContextResolver {
  constructor(
    private readonly mutex: RequestMutex,
    private readonly context: CopilotContextService,
    private readonly copilotUser: CopilotUserService
  ) {}

  @ResolveField(() => [CopilotContextChatOrDoc], {
    description: 'list files in context',
  })
  @CallMetric('ai', 'context_file_list')
  async chats(
    @Parent() context: CopilotContextType
  ): Promise<CopilotContextChatOrDoc[]> {
    if (!context.id) {
      return [];
    }
    const session = await this.context.get(context.id);
    return session.chats;
  }

  @ResolveField(() => [CopilotContextChatOrDoc], {
    description: 'list files in context',
  })
  @CallMetric('ai', 'context_file_list')
  async docs(
    @Parent() context: CopilotContextType
  ): Promise<CopilotContextChatOrDoc[]> {
    if (!context.id) {
      return [];
    }
    const session = await this.context.get(context.id);
    return session.docs;
  }

  @ResolveField(() => [CopilotContextFile], {
    description: 'list files in context',
  })
  @CallMetric('ai', 'context_file_list')
  async files(
    @Parent() context: CopilotContextType
  ): Promise<CopilotContextFile[]> {
    if (!context.id) {
      return [];
    }
    const session = await this.context.get(context.id);
    return session.files;
  }

  @Mutation(() => CopilotContextChatOrDoc, {
    description: 'add a chat to context',
  })
  @CallMetric('ai', 'context_file_add')
  async addContextChat(
    @CurrentUser() user: CurrentUser,
    @Args({ name: 'contextId' }) contextId: string,
    @Args({ name: 'sessionId' }) sessionId: string
  ): Promise<CopilotContextChatOrDoc> {
    const lockFlag = `${COPILOT_LOCKER}:context:${contextId}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }

    const context = await this.context.get(contextId);

    try {
      const chat = await context.addChat(sessionId);

      await this.copilotUser.queueChatEmbedding({
        userId: user.id,
        contextId: context.id,
        sessionId: chat.id,
      });

      return chat;
    } catch (e: any) {
      // passthrough user friendly error
      if (e instanceof UserFriendlyError) {
        throw e;
      }
      throw new CopilotFailedToModifyContext({ contextId, message: e.message });
    }
  }

  @Mutation(() => CopilotContextChatOrDoc, {
    description: 'add a chat to context',
  })
  @CallMetric('ai', 'context_file_add')
  async addContextDoc(
    @CurrentUser() user: CurrentUser,
    @Args({ name: 'contextId' }) contextId: string,
    @Args({ name: 'docId' }) docId: string
  ): Promise<CopilotContextChatOrDoc> {
    const lockFlag = `${COPILOT_LOCKER}:context:${contextId}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }

    const context = await this.context.get(contextId);

    try {
      const doc = await context.addDoc(docId);

      await this.copilotUser.queueDocEmbedding({
        userId: user.id,
        contextId: context.id,
        docId: doc.id,
      });

      return doc;
    } catch (e: any) {
      // passthrough user friendly error
      if (e instanceof UserFriendlyError) {
        throw e;
      }
      throw new CopilotFailedToModifyContext({ contextId, message: e.message });
    }
  }

  @Mutation(() => CopilotContextFile, {
    description: 'add a file to context',
  })
  @CallMetric('ai', 'context_file_add')
  async addContextFile(
    @CurrentUser() user: CurrentUser,
    @Context() ctx: { req: Request },
    @Args({ name: 'contextId' }) contextId: string,
    @Args({ name: 'content', type: () => GraphQLUpload, nullable: true })
    content?: FileUpload,
    @Args({ name: 'blobId', type: () => String, nullable: true })
    blobId?: string
  ): Promise<CopilotContextFile> {
    const lockFlag = `${COPILOT_LOCKER}:context:${contextId}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }

    const length = Number(ctx.req.headers['content-length']);
    if (length && length >= MAX_EMBEDDABLE_SIZE) {
      throw new BlobQuotaExceeded();
    }

    const session = await this.context.get(contextId);

    try {
      if (content) {
        const { blobId, file } = await this.copilotUser.addFile(
          user.id,
          content
        );

        await this.copilotUser.queueFileEmbedding({
          userId: user.id,
          contextId: session.id,
          blobId: file.blobId,
          fileId: file.fileId,
          fileName: file.fileName,
        });

        const finalFile = await session.addFile(
          blobId,
          file.fileName,
          file.mimeType,
          file.fileId
        );

        return finalFile;
      } else if (blobId) {
        const existsFile = await this.copilotUser.getFile(user.id, { blobId });
        if (existsFile) {
          const file = await session.addFile(
            blobId,
            existsFile.fileName,
            existsFile.mimeType
          );
          return file;
        }
      }
      throw new BlobNotFound({
        userId: user.id,
        blobId: blobId || 'no provided',
      });
    } catch (e: any) {
      // passthrough user friendly error
      if (e instanceof UserFriendlyError) {
        throw e;
      }
      throw new CopilotFailedToModifyContext({ contextId, message: e.message });
    }
  }

  @ResolveField(() => Boolean, {
    description: 'remove a chat from context',
  })
  @CallMetric('ai', 'context_chat_remove')
  async removeContextChat(
    @Parent() context: CopilotContextType,
    @Args({ name: 'sessionId' }) sessionId: string
  ): Promise<boolean> {
    if (!context.id) {
      throw new CopilotInvalidContext({ contextId: context.id || 'undefined' });
    }
    const lockFlag = `${COPILOT_LOCKER}:context:${context.id}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }
    const session = await this.context.get(context.id);

    try {
      return await session.removeChat(sessionId);
    } catch (e: any) {
      throw new CopilotFailedToModifyContext({
        contextId: context.id,
        message: e.message,
      });
    }
  }

  @ResolveField(() => Boolean, {
    description: 'remove a doc from context',
  })
  @CallMetric('ai', 'context_doc_remove')
  async removeContextDoc(
    @Parent() context: CopilotContextType,
    @Args({ name: 'docId' }) docId: string
  ): Promise<boolean> {
    if (!context.id) {
      throw new CopilotInvalidContext({ contextId: context.id || 'undefined' });
    }
    const lockFlag = `${COPILOT_LOCKER}:context:${context.id}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }
    const session = await this.context.get(context.id);

    try {
      return await session.removeDoc(docId);
    } catch (e: any) {
      throw new CopilotFailedToModifyContext({
        contextId: context.id,
        message: e.message,
      });
    }
  }

  @ResolveField(() => Boolean, {
    description: 'remove a file from context',
  })
  @CallMetric('ai', 'context_file_remove')
  async removeContextFile(
    @Parent() context: CopilotContextType,
    @Args({ name: 'fileId' }) fileId: string
  ): Promise<boolean> {
    if (!context.id) {
      throw new CopilotInvalidContext({ contextId: context.id || 'undefined' });
    }
    const lockFlag = `${COPILOT_LOCKER}:context:${context.id}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }
    const session = await this.context.get(context.id);

    try {
      return await session.removeFile(fileId);
    } catch (e: any) {
      throw new CopilotFailedToModifyContext({
        contextId: context.id,
        message: e.message,
      });
    }
  }
}
