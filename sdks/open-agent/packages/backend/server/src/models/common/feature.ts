import { z } from 'zod';

import { OneGB, OneMB } from '../../base';

const UserPlanQuotaConfig = z.object({
  // quota name
  name: z.string(),
  // single blob limit
  blobLimit: z.number(),
  // total blob limit
  storageQuota: z.number(),
  // copilot limit
  copilotLimit: z.number().optional(),
});

export type UserQuota = z.infer<typeof UserPlanQuotaConfig>;

const EMPTY_CONFIG = z.object({});

export enum FeatureType {
  Feature,
  Quota,
}

export enum Feature {
  Administrator = 'administrator',
  EarlyAccess = 'early_access',
  UnlimitedCopilot = 'unlimited_copilot',
  FreePlan = 'free_plan_v1',
  ProPlan = 'pro_plan_v1',
}

export const FeaturesShapes = {
  administrator: EMPTY_CONFIG,
  early_access: EMPTY_CONFIG,
  unlimited_copilot: EMPTY_CONFIG,
  free_plan_v1: UserPlanQuotaConfig,
  pro_plan_v1: UserPlanQuotaConfig,
} satisfies Record<Feature, z.ZodObject<any>>;

export type UserFeatureName = keyof Pick<
  typeof FeaturesShapes,
  | 'administrator'
  | 'early_access'
  | 'unlimited_copilot'
  | 'free_plan_v1'
  | 'pro_plan_v1'
>;
export type FeatureName = UserFeatureName;
export type FeatureConfig<T extends FeatureName> = z.infer<
  (typeof FeaturesShapes)[T]
>;

export const FeatureConfigs: {
  [K in FeatureName]: {
    type: FeatureType;
    configs: FeatureConfig<K>;
  };
} = {
  free_plan_v1: {
    type: FeatureType.Quota,
    configs: {
      // quota name
      name: 'Free',
      blobLimit: 10 * OneMB,
      storageQuota: 10 * OneGB,
      copilotLimit: undefined,
    },
  },
  pro_plan_v1: {
    type: FeatureType.Quota,
    configs: {
      name: 'Pro',
      blobLimit: 100 * OneMB,
      storageQuota: 100 * OneGB,
      copilotLimit: undefined,
    },
  },
  administrator: {
    type: FeatureType.Feature,
    configs: {},
  },
  early_access: {
    type: FeatureType.Feature,
    configs: {},
  },
  unlimited_copilot: {
    type: FeatureType.Feature,
    configs: {},
  },
};
