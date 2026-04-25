import { AiJobStatus, AiJobType, PrismaClient, User } from '@prisma/client';
import ava, { TestFn } from 'ava';

import { Config } from '../../base';
import { CopilotJobModel } from '../../models';
import { UserModel } from '../../models/user';
import { createTestingModule, type TestingModule } from '../utils';

interface Context {
  config: Config;
  module: TestingModule;
  db: PrismaClient;
  user: UserModel;
  copilotJob: CopilotJobModel;
}

const test = ava as TestFn<Context>;

test.before(async t => {
  const module = await createTestingModule();
  t.context.user = module.get(UserModel);
  t.context.copilotJob = module.get(CopilotJobModel);
  t.context.db = module.get(PrismaClient);
  t.context.config = module.get(Config);
  t.context.module = module;
});

let user: User;

test.beforeEach(async t => {
  await t.context.module.initTestingDB();
  user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
});

test.after(async t => {
  await t.context.module.close();
});

test('should create a copilot job', async t => {
  const data = {
    blobId: 'blob-id',
    createdBy: user.id,
    type: AiJobType.transcription,
  };

  const job = await t.context.copilotJob.create(data);

  t.truthy(job.id);

  const job1 = await t.context.copilotJob.get(job.id);
  t.deepEqual(
    {
      ...data,
      id: job.id,
      status: AiJobStatus.pending,
      payload: {},
    },
    job1
  );
});

test('should get null for non-exist job', async t => {
  const job = await t.context.copilotJob.get('non-exist');
  t.is(job, null);
});

test('should update job', async t => {
  const { id: jobId } = await t.context.copilotJob.create({
    blobId: 'blob-id',
    createdBy: user.id,
    type: AiJobType.transcription,
  });

  const hasJob = await t.context.copilotJob.has(user.id, 'blob-id');
  t.true(hasJob);

  const job = await t.context.copilotJob.get(jobId);

  const data = {
    status: AiJobStatus.running,
    payload: { foo: 'bar' },
  };
  await t.context.copilotJob.update(jobId, data);
  const job1 = await t.context.copilotJob.get(jobId);
  t.deepEqual(job1, { ...job, ...data });
});

test('should claim job', async t => {
  const { id: jobId } = await t.context.copilotJob.create({
    blobId: 'blob-id',
    createdBy: user.id,
    type: AiJobType.transcription,
  });

  const status = await t.context.copilotJob.claim(jobId, user.id);
  t.is(status, AiJobStatus.pending, 'should not claim non-finished job');

  await t.context.copilotJob.update(jobId, { status: AiJobStatus.finished });

  const status1 = await t.context.copilotJob.claim(jobId, 'non-exist-user');
  t.is(
    status1,
    AiJobStatus.finished,
    'should not claim job created by other user'
  );

  const status2 = await t.context.copilotJob.claim(jobId, user.id);
  t.is(status2, AiJobStatus.claimed, 'should claim finished job');

  const status3 = await t.context.copilotJob.get(jobId);
  t.is(
    status3?.status,
    AiJobStatus.claimed,
    'should update job status to claimed'
  );
});
