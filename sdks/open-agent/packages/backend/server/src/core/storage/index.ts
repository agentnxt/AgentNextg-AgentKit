import './config';

import { Module } from '@nestjs/common';

import { AvatarStorage } from './wrappers';

@Module({
  providers: [AvatarStorage],
  exports: [AvatarStorage],
})
export class StorageModule {}

export { AvatarStorage };
