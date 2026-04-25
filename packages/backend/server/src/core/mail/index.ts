import './config';

import { Module } from '@nestjs/common';

import { StorageModule } from '../storage';
import { MailJob } from './job';
import { Mailer } from './mailer';
import { MailResolver } from './resolver';
import { MailSender } from './sender';

@Module({
  imports: [StorageModule],
  providers: [MailSender, Mailer, MailJob, MailResolver],
  exports: [Mailer],
})
export class MailModule {}
export { Mailer };
