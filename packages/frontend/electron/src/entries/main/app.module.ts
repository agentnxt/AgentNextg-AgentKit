import { Module } from '@nestjs/common';

import { ElectronIpcModule } from '../../ipc';
import { HelperProcessModule } from './helper-process';
import { MiscModule } from './misc';
import { StateModule } from './state';
import { WindowsModule } from './windows';

@Module({
  imports: [
    ElectronIpcModule.forMain(),
    HelperProcessModule,
    WindowsModule,
    MiscModule,
    StateModule,
  ],
})
export class AppModule {}
