import './config';

import { Global, Module } from '@nestjs/common';

import { CryptoHelper } from './crypto';
import { StaticFilesResolver } from './static';
import { URLHelper } from './url';

@Global()
@Module({
  providers: [URLHelper, CryptoHelper, StaticFilesResolver],
  exports: [URLHelper, CryptoHelper],
})
export class HelpersModule {}

export { CryptoHelper, URLHelper };
