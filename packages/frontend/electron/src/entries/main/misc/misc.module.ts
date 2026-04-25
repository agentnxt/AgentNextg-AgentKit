import { Module } from '@nestjs/common';

import { ProtocolService } from './protocol.service';
import { SecurityService } from './security.service';
import { UtilsHandleService } from './utils-handle.service';

@Module({
  providers: [ProtocolService, SecurityService, UtilsHandleService],
})
export class MiscModule {}
