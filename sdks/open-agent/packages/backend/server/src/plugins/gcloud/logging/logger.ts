import { WinstonLogger } from 'nest-winston';

import { OpenAgentLogger as RawOpenAgentLogger } from '../../../base/logger';

export class OpenAgentLogger extends WinstonLogger {
  override error(
    message: any,
    stackOrError?: Error | string | unknown,
    context?: string
  ) {
    super.error(
      message,
      RawOpenAgentLogger.formatStack(stackOrError) as string,
      context
    );
  }
}
