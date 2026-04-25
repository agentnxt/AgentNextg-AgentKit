import { Injectable, Logger } from '@nestjs/common';

import { InternalServerError, OnEvent } from '../../base';
import { Models, type UserQuota } from '../../models';
import { UserQuotaHumanReadableType, UserQuotaType } from './types';
import { formatSize } from './utils';

type UserQuotaWithUsage = Omit<UserQuotaType, 'humanReadable'>;

@Injectable()
export class QuotaService {
  protected logger = new Logger(QuotaService.name);

  constructor(private readonly models: Models) {}

  @OnEvent('user.postCreated')
  async onUserCreated({ id }: Events['user.postCreated']) {
    await this.setupUserBaseQuota(id);
  }

  async getUserQuota(userId: string): Promise<UserQuota> {
    let quota = await this.models.userFeature.getQuota(userId);

    // not possible, but just in case, we do a little fix for user to avoid system dump
    if (!quota) {
      await this.setupUserBaseQuota(userId);
      quota = await this.models.userFeature.getQuota(userId);
    }

    if (!quota) {
      throw new InternalServerError(
        'User quota not found and can not be created.'
      );
    }

    return {
      ...quota.configs,
    } as UserQuotaWithUsage;
  }

  async getUserQuotaWithUsage(userId: string): Promise<UserQuotaWithUsage> {
    const quota = await this.getUserQuota(userId);
    const usedStorageQuota = await this.getUserStorageUsage(userId);

    return { ...quota, usedStorageQuota };
  }

  // TODO(@darkskygit): implement this
  async getUserStorageUsage(_userId: string) {
    return 0;
  }

  formatUserQuota(
    quota: Omit<UserQuotaType, 'humanReadable'>
  ): UserQuotaHumanReadableType {
    return {
      name: quota.name,
      blobLimit: formatSize(quota.blobLimit),
      storageQuota: formatSize(quota.storageQuota),
      usedStorageQuota: formatSize(quota.usedStorageQuota),
      copilotLimit: quota.copilotLimit
        ? formatSize(quota.copilotLimit)
        : 'Unlimited',
    };
  }

  async getUserQuotaCalculator(userId: string) {
    const quota = await this.getUserQuota(userId);
    const usedSize = 0; //await this.getUserStorageUsage(userId);

    return this.generateQuotaCalculator(
      quota.storageQuota,
      quota.blobLimit,
      usedSize
    );
  }

  private async setupUserBaseQuota(userId: string) {
    await this.models.userFeature.add(userId, 'free_plan_v1', 'sign up');
  }

  private generateQuotaCalculator(
    storageQuota: number,
    blobLimit: number,
    usedQuota: number,
    unlimited = false
  ) {
    const checkExceeded = (recvSize: number) => {
      const currentSize = usedQuota + recvSize;
      // only skip total storage check if workspace has unlimited feature
      if (currentSize > storageQuota && !unlimited) {
        this.logger.warn(
          `storage size limit exceeded: ${currentSize} > ${storageQuota}`
        );
        return { storageQuotaExceeded: true, blobQuotaExceeded: false };
      } else if (recvSize > blobLimit) {
        this.logger.warn(
          `blob size limit exceeded: ${recvSize} > ${blobLimit}`
        );
        return { storageQuotaExceeded: false, blobQuotaExceeded: true };
      } else {
        return;
      }
    };
    return checkExceeded;
  }
}
