import { Module } from '@nestjs/common';

import { StorageModule } from '../storage';
import { UserAvatarController } from './controller';
import {
  UserManagementResolver,
  UserResolver,
  UserSettingsResolver,
} from './resolver';

@Module({
  imports: [StorageModule],
  providers: [UserResolver, UserManagementResolver, UserSettingsResolver],
  controllers: [UserAvatarController],
})
export class UserModule {}

export { PublicUserType, UserType, WorkspaceUserType } from './types';
