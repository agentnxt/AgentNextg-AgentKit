import { Injectable, Logger } from '@nestjs/common';

import { Config } from '../../base';
import { Models } from '../../models';

const STAFF = ['@toeverything.info', '@open-agent.io'];

@Injectable()
export class FeatureService {
  protected logger = new Logger(FeatureService.name);

  constructor(
    private readonly config: Config,
    private readonly models: Models
  ) {}

  // ======== Admin ========
  isStaff(email: string) {
    for (const domain of STAFF) {
      if (email.endsWith(domain)) {
        return true;
      }
    }
    return false;
  }

  isAdmin(userId: string) {
    return this.models.userFeature.has(userId, 'administrator');
  }

  addAdmin(userId: string) {
    return this.models.userFeature.add(userId, 'administrator', 'Admin user');
  }

  // ======== Early Access ========
  async addEarlyAccess(userId: string) {
    return this.models.userFeature.add(
      userId,
      'early_access',
      'Early access user'
    );
  }

  async removeEarlyAccess(userId: string) {
    return this.models.userFeature.remove(userId, 'early_access');
  }

  async isEarlyAccessUser(userId: string) {
    return await this.models.userFeature.has(userId, 'early_access');
  }

  async canEarlyAccess(email: string) {
    const earlyAccessControlEnabled = this.config.flags.earlyAccessControl;

    if (earlyAccessControlEnabled && !this.isStaff(email)) {
      const user = await this.models.user.getUserByEmail(email);
      if (!user) {
        return false;
      }
      return this.isEarlyAccessUser(user.id);
    } else {
      return true;
    }
  }
}
