import { Module } from '@nestjs/common';

import {
  AdminFeatureManagementResolver,
  UserFeatureResolver,
} from './resolver';
import { FeatureService } from './service';

@Module({
  providers: [
    UserFeatureResolver,
    AdminFeatureManagementResolver,
    FeatureService,
  ],
  exports: [FeatureService],
})
export class FeatureModule {}

export { FeatureService };
export { AvailableUserFeatureConfig } from './types';
