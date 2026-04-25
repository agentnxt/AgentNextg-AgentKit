import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '../config';
import { OpenAgentLogger } from './service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [OpenAgentLogger],
  exports: [OpenAgentLogger],
})
export class LoggerModule {}

export { OpenAgentLogger } from './service';
