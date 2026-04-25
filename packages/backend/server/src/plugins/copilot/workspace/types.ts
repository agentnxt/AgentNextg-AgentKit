import { Field, ObjectType } from '@nestjs/graphql';
import { SafeIntResolver } from 'graphql-scalars';

import { Paginated } from '../../../base';
import { CopilotUserDoc, CopilotUserFile } from '../../../models';

declare global {
  interface Events {
    'workspace.file.embedding.finished': {
      jobId: string;
    };
    'workspace.file.embedding.failed': {
      jobId: string;
    };
  }
}

@ObjectType('CopilotUserDoc')
export class CopilotUserDocType implements CopilotUserDoc {
  @Field(() => String)
  docId!: string;

  @Field(() => String)
  sessionId!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  content!: string;

  @Field(() => String)
  metadata!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType('CopilotUserFile')
export class CopilotUserFileType implements CopilotUserFile {
  @Field(() => String)
  userId!: string;

  @Field(() => String)
  fileId!: string;

  @Field(() => String)
  blobId!: string;

  @Field(() => String)
  fileName!: string;

  @Field(() => String)
  mimeType!: string;

  @Field(() => SafeIntResolver)
  size!: number;

  @Field(() => String)
  metadata!: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType('PaginatedCopilotUserDoc')
export class PaginatedCopilotUserDocType extends Paginated(
  CopilotUserDocType
) {}

@ObjectType('PaginatedCopilotUserFile')
export class PaginatedCopilotUserFileType extends Paginated(
  CopilotUserFileType
) {}
