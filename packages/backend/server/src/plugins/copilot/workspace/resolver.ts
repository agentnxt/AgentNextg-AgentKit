import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  CopilotFailedToAddUserArtifact,
  Mutex,
  paginate,
  PaginationInput,
  TooManyRequest,
  UserFriendlyError,
} from '../../../base';
import { CurrentUser } from '../../../core/auth';
import { UserType } from '../../../core/user';
import { COPILOT_LOCKER } from '../resolver';
import { CopilotUserService } from './service';
import {
  CopilotUserDocType,
  CopilotUserFileType,
  PaginatedCopilotUserDocType,
  PaginatedCopilotUserFileType,
} from './types';

@ObjectType('CopilotUserConfig')
export class CopilotUserConfigType {
  @Field(() => String)
  userId!: string;
}

/**
 * User embedding config resolver
 * Public apis rate limit: 10 req/m
 * Other rate limit: 120 req/m
 */
@Resolver(() => UserType)
export class CopilotUserEmbeddingResolver {
  @ResolveField(() => CopilotUserConfigType, {
    complexity: 2,
  })
  async embedding(
    @CurrentUser() user: CurrentUser
  ): Promise<CopilotUserConfigType> {
    return { userId: user.id };
  }
}

@Resolver(() => CopilotUserConfigType)
export class CopilotUserEmbeddingConfigResolver {
  constructor(
    private readonly mutex: Mutex,
    private readonly copilotUser: CopilotUserService
  ) {}

  @ResolveField(() => PaginatedCopilotUserDocType, {
    description: 'list user docs in context',
  })
  async docs(
    @CurrentUser() user: CurrentUser,
    @Args('pagination', PaginationInput.decode) pagination: PaginationInput
  ): Promise<PaginatedCopilotUserDocType> {
    const [docs, totalCount] = await this.copilotUser.listDocs(
      user.id,
      pagination
    );

    return paginate(docs, 'createdAt', pagination, totalCount);
  }

  @ResolveField(() => PaginatedCopilotUserFileType, {
    complexity: 2,
  })
  async files(
    @Parent() config: CopilotUserConfigType,
    @Args('pagination', PaginationInput.decode) pagination: PaginationInput
  ): Promise<PaginatedCopilotUserFileType> {
    const [files, totalCount] = await this.copilotUser.listFiles(
      config.userId,
      pagination
    );

    return paginate(files, 'createdAt', pagination, totalCount);
  }

  @Mutation(() => CopilotUserDocType, {
    complexity: 2,
    description: 'Add user embedding doc',
  })
  async addUserDocs(
    @CurrentUser() user: CurrentUser,
    @Args('sessionId', { type: () => String }) sessionId: string,
    @Args('title', { type: () => String }) title: string,
    @Args('content', { type: () => String }) content: string,
    @Args('metadata', { type: () => String, nullable: true }) metadata?: string
  ): Promise<CopilotUserDocType> {
    const lockFlag = `${COPILOT_LOCKER}:user:${user.id}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }

    if (!title || !content) {
      throw new CopilotFailedToAddUserArtifact({
        type: 'doc',
        message: 'Title and content are required',
      });
    }

    try {
      const options = { title, content, metadata };
      const doc = await this.copilotUser.addDoc(user.id, sessionId, options);
      await this.copilotUser.queueDocEmbedding({
        userId: user.id,
        docId: doc.docId,
      });
      return doc;
    } catch (e: any) {
      // passthrough user friendly error
      if (e instanceof UserFriendlyError) {
        throw e;
      }
      throw new CopilotFailedToAddUserArtifact({
        type: 'doc',
        message: e.message,
      });
    }
  }

  @Mutation(() => CopilotUserDocType, {
    complexity: 2,
    description: 'Update user embedding doc',
  })
  async updateUserDocs(
    @CurrentUser() user: CurrentUser,
    @Args('docId', { type: () => String }) docId: string,
    @Args('title', { type: () => String, nullable: true }) title?: string,
    @Args('content', { type: () => String, nullable: true }) content?: string,
    @Args('metadata', { type: () => String, nullable: true }) metadata?: string
  ): Promise<CopilotUserDocType> {
    const lockFlag = `${COPILOT_LOCKER}:user:${user.id}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }

    if (!docId) {
      throw new CopilotFailedToAddUserArtifact({
        type: 'doc',
        message: 'Doc ID is required for update',
      });
    }
    if (!title || !content || !metadata) {
      throw new CopilotFailedToAddUserArtifact({
        type: 'doc',
        message: 'At least one field must be provided for doc update.',
      });
    }

    try {
      const update = { title, content, metadata };
      const doc = await this.copilotUser.updateDoc(user.id, docId, update);
      await this.copilotUser.queueDocEmbedding({
        userId: user.id,
        docId: doc.docId,
      });
      return doc;
    } catch (e: any) {
      // passthrough user friendly error
      if (e instanceof UserFriendlyError) {
        throw e;
      }
      throw new CopilotFailedToAddUserArtifact({
        type: 'doc',
        message: e.message,
      });
    }
  }

  @Mutation(() => CopilotUserFileType, {
    complexity: 2,
    description: 'Update user embedding files',
  })
  async updateUserFiles(
    @CurrentUser() user: CurrentUser,
    @Args('fileId', { type: () => String }) fileId: string,
    @Args('metadata', { type: () => String }) metadata: string
  ): Promise<CopilotUserFileType> {
    const lockFlag = `${COPILOT_LOCKER}:user:${user.id}`;
    await using lock = await this.mutex.acquire(lockFlag);
    if (!lock) {
      throw new TooManyRequest('Server is busy');
    }

    if (!fileId) {
      throw new CopilotFailedToAddUserArtifact({
        type: 'file',
        message: 'File ID is required for update',
      });
    }

    try {
      return await this.copilotUser.updateFile(user.id, fileId, metadata);
    } catch (e: any) {
      // passthrough user friendly error
      if (e instanceof UserFriendlyError) {
        throw e;
      }
      throw new CopilotFailedToAddUserArtifact({
        type: 'doc',
        message: e.message,
      });
    }
  }

  @Mutation(() => Boolean, {
    complexity: 2,
    description: 'Remove user embedding doc',
  })
  async removeUserDocs(
    @CurrentUser() user: CurrentUser,
    @Args('docId', { type: () => String }) docId: string
  ): Promise<boolean> {
    return await this.copilotUser.removeDoc(user.id, docId);
  }

  @Mutation(() => Boolean, {
    complexity: 2,
    description: 'Remove user embedding files',
  })
  async removeUserFiles(
    @CurrentUser() user: CurrentUser,
    @Args('fileId', { type: () => String })
    fileId: string
  ): Promise<boolean> {
    return await this.copilotUser.removeFile(user.id, fileId);
  }
}
