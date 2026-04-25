import { Field, ObjectType } from '@nestjs/graphql';
import { SafeIntResolver } from 'graphql-scalars';

import { UserQuota } from '../../models';

@ObjectType()
export class UserQuotaHumanReadableType {
  @Field()
  name!: string;

  @Field()
  blobLimit!: string;

  @Field()
  storageQuota!: string;

  @Field()
  usedStorageQuota!: string;

  @Field()
  copilotLimit!: string;
}

@ObjectType()
export class UserQuotaType implements UserQuota {
  @Field()
  name!: string;

  @Field(() => SafeIntResolver)
  blobLimit!: number;

  @Field(() => SafeIntResolver)
  storageQuota!: number;

  @Field(() => SafeIntResolver)
  usedStorageQuota!: number;

  @Field(() => SafeIntResolver, { nullable: true })
  copilotLimit?: number;

  @Field(() => UserQuotaHumanReadableType)
  humanReadable!: UserQuotaHumanReadableType;
}
