import './config';

import { Module } from '@nestjs/common';

import { ServerConfigModule } from '../../core';
import { FeatureModule } from '../../core/features';
import { QuotaModule } from '../../core/quota';
import {
  CopilotContextResolver,
  CopilotContextRootResolver,
  CopilotContextService,
} from './context';
import { CopilotController } from './controller';
import { CopilotCronJobs } from './cron';
import { CopilotEmbeddingJob } from './embedding';
import { ChatMessageCache } from './message';
import { PromptService } from './prompt';
import { CopilotProviderFactory, CopilotProviders } from './providers';
import {
  CopilotResolver,
  PromptsManagementResolver,
  UserCopilotResolver,
} from './resolver';
import { ChatSessionService } from './session';
import { CopilotStorage } from './storage';
import {
  CopilotTranscriptionResolver,
  CopilotTranscriptionService,
} from './transcript';
import { CopilotWorkflowExecutors, CopilotWorkflowService } from './workflow';
import {
  CopilotUserEmbeddingConfigResolver,
  CopilotUserEmbeddingResolver,
  CopilotUserService,
} from './workspace';

@Module({
  imports: [FeatureModule, QuotaModule, ServerConfigModule],
  providers: [
    // providers
    ...CopilotProviders,
    CopilotProviderFactory,
    // services
    ChatSessionService,
    CopilotResolver,
    ChatMessageCache,
    PromptService,
    CopilotStorage,
    // workflow
    CopilotWorkflowService,
    ...CopilotWorkflowExecutors,
    // context
    CopilotContextResolver,
    CopilotContextService,
    // jobs
    CopilotEmbeddingJob,
    CopilotCronJobs,
    // transcription
    CopilotTranscriptionService,
    CopilotTranscriptionResolver,
    // workspace embeddings
    CopilotUserService,
    CopilotUserEmbeddingConfigResolver,
    CopilotUserEmbeddingResolver,
    // gql resolvers
    UserCopilotResolver,
    PromptsManagementResolver,
    CopilotContextRootResolver,
  ],
  controllers: [CopilotController],
})
export class CopilotModule {}
