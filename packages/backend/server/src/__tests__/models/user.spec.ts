import ava, { TestFn } from 'ava';
import Sinon from 'sinon';

import { EmailAlreadyUsed, EventBus } from '../../base';
import { Models } from '../../models';
import { UserModel } from '../../models/user';
import { createTestingModule, type TestingModule } from '../utils';

interface Context {
  module: TestingModule;
  models: Models;
  user: UserModel;
}

const test = ava as TestFn<Context>;

test.before(async t => {
  const module = await createTestingModule({});

  t.context.user = module.get(UserModel);
  t.context.models = module.get(Models);
  t.context.module = module;
});

test.beforeEach(async t => {
  await t.context.module.initTestingDB();
});

test.after(async t => {
  await t.context.module.close();
});

test('should create a new user', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  t.is(user.email, 'test@open-agent.io');

  const user2 = await t.context.user.getUserByEmail('test@open-agent.io');

  t.not(user2, null);
  t.is(user2!.email, 'test@open-agent.io');
});

test('should trigger user.created event', async t => {
  const event = t.context.module.get(EventBus);
  const spy = Sinon.spy();
  event.on('user.created', spy);

  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  t.true(spy.calledOnceWithExactly(user));
});

test('should sign in user with password', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
    password: 'password',
  });

  const signedInUser = await t.context.user.signIn(user.email, 'password');

  t.is(signedInUser.id, user.id);
  // Password is encrypted
  t.not(signedInUser.password, 'password');
});

test('should update an user', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const user2 = await t.context.user.update(user.id, {
    email: 'test2@open-agent.io',
  });

  t.is(user2.email, 'test2@open-agent.io');
});

test('should update password', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
    password: 'password',
  });

  const updatedUser = await t.context.user.update(user.id, {
    password: 'new password',
  });

  t.not(updatedUser.password, user.password);
  // password is encrypted
  t.not(updatedUser.password, 'new password');
});

test('should not update email to an existing one', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
  const user2 = await t.context.user.create({
    email: 'test2@open-agent.io',
  });

  await t.throwsAsync(
    () =>
      t.context.user.update(user.id, {
        email: user2.email,
      }),
    {
      instanceOf: EmailAlreadyUsed,
    }
  );
});

test('should trigger user.updated event', async t => {
  const event = t.context.module.get(EventBus);
  const spy = Sinon.spy();
  event.on('user.updated', spy);

  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const updatedUser = await t.context.user.update(user.id, {
    email: 'test2@open-agent.io',
    name: 'new name',
  });

  t.true(spy.calledOnceWithExactly(updatedUser));
});

test('should get user by id', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const user2 = await t.context.user.get(user.id);

  t.not(user2, null);
  t.is(user2!.id, user.id);
});

test('should get public user by id', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const publicUser = await t.context.user.getPublicUser(user.id);

  t.not(publicUser, null);
  t.is(publicUser!.id, user.id);
  t.true(!('password' in publicUser!));
  t.true(!('email' in publicUser!));
});

test('should get public user by email', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const publicUser = await t.context.user.getPublicUserByEmail(user.email);

  t.not(publicUser, null);
  t.is(publicUser!.id, user.id);
  t.true(!('password' in publicUser!));
  t.true(!('email' in publicUser!));
});

test('should get workspace user by id', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const workspaceUser = await t.context.user.getWorkspaceUser(user.id);

  t.not(workspaceUser, null);
  t.is(workspaceUser!.id, user.id);
  t.true(!('password' in workspaceUser!));
  t.is(workspaceUser!.email, user.email);
});

test('should get user by email', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const user2 = await t.context.user.getUserByEmail(user.email);

  t.not(user2, null);
  t.is(user2!.id, user.id);
});

test('should ignore case when getting user by email', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  const user2 = await t.context.user.getUserByEmail('TEST@open-agent.io');

  t.not(user2, null);
  t.is(user2!.id, user.id);
});

test('should return null for non existing user', async t => {
  const user = await t.context.user.getUserByEmail('test@open-agent.io');

  t.is(user, null);
});

test('should fulfill user', async t => {
  let user = await t.context.user.create({
    email: 'test@open-agent.io',
    registered: false,
  });

  t.is(user.registered, false);
  t.is(user.emailVerifiedAt, null);

  user = await t.context.user.fulfill(user.email);

  t.is(user.registered, true);
  t.not(user.emailVerifiedAt, null);

  const user2 = await t.context.user.fulfill('test2@open-agent.io');

  t.is(user2.registered, true);
  t.not(user2.emailVerifiedAt, null);
});

test('should trigger user.updated event when fulfilling user', async t => {
  const event = t.context.module.get(EventBus);
  const createSpy = Sinon.spy();
  const updateSpy = Sinon.spy();
  event.on('user.created', createSpy);
  event.on('user.updated', updateSpy);

  const user2 = await t.context.user.fulfill('test2@open-agent.io');

  t.true(createSpy.calledOnceWithExactly(user2));

  let user = await t.context.user.create({
    email: 'test@open-agent.io',
    registered: false,
  });

  user = await t.context.user.fulfill(user.email);

  t.true(updateSpy.calledOnceWithExactly(user));
});

test('should delete user', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });

  await t.context.user.delete(user.id);

  const user2 = await t.context.user.get(user.id);

  t.is(user2, null);
});

test('should paginate users', async t => {
  const now = Date.now();
  await Promise.all(
    Array.from({ length: 100 }).map((_, i) =>
      t.context.user.create({
        name: `test-paginate-${i}`,
        email: `test-paginate-${i}@open-agent.io`,
        createdAt: new Date(now + i),
        disabled: i % 2 === 0,
      })
    )
  );

  const users = await t.context.user.pagination(0, 10);
  t.is(users.length, 10);
  t.deepEqual(
    users.map(user => user.email),
    Array.from({ length: 10 }).map((_, i) => `test-paginate-${i}@open-agent.io`)
  );
});

// #region disabled user
test('should not get disabled user by default', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
    disabled: true,
  });

  const user2 = await t.context.user.get(user.id);
  const user3 = await t.context.user.getPublicUser(user.id);
  const user4 = await t.context.user.getPublicUserByEmail(user.email);
  const userList1 = await t.context.user.getPublicUsers([user.id]);
  const user5 = await t.context.user.getWorkspaceUser(user.id);
  const userList2 = await t.context.user.getWorkspaceUsers([user.id]);

  t.is(user2, null);
  t.is(user3, null);
  t.is(user4, null);
  t.is(user5, null);
  t.is(userList1.length, 0);
  t.is(userList2.length, 0);
});

test('should get disabled user `withDisabled`', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
    disabled: true,
  });

  const user2 = await t.context.user.get(user.id, { withDisabled: true });
  const user3 = await t.context.user.getUserByEmail(user.email, {
    withDisabled: true,
  });

  t.is(user2!.id, user.id);
  t.is(user3!.id, user.id);
});

test('should not be able to update email to disabled user', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
    disabled: false,
  });
  const user2 = await t.context.user.create({
    email: 'test2@open-agent.io',
    disabled: true,
  });

  await t.throwsAsync(
    t.context.user.update(user.id, {
      email: user2.email,
    }),
    {
      instanceOf: EmailAlreadyUsed,
    }
  );
});

test('should ban user', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
  const event = t.context.module.get(EventBus);
  const spy = Sinon.spy();
  event.on('user.deleted', spy);

  await t.context.user.ban(user.id);

  t.true(spy.calledOnce);
  const user2 = await t.context.user.get(user.id);
  t.is(user2, null);
});

test('should enable user', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
    disabled: true,
  });

  const user2 = await t.context.user.enable(user.id);

  t.is(user2.disabled, false);

  const user3 = await t.context.user.get(user.id);
  t.is(user3!.id, user.id);
});

// #endregion

// #region ConnectedAccount

test('should create, get, update, delete connected account', async t => {
  const user = await t.context.user.create({
    email: 'test@open-agent.io',
  });
  const connectedAccount = await t.context.user.createConnectedAccount({
    userId: user.id,
    provider: 'test-provider',
    providerAccountId: 'test-provider-account-id',
    accessToken: 'test-access-token',
  });
  t.truthy(connectedAccount);

  const connectedAccount2 = await t.context.user.getConnectedAccount(
    connectedAccount.provider,
    connectedAccount.providerAccountId
  );
  t.truthy(connectedAccount2);
  t.is(connectedAccount2!.id, connectedAccount.id);
  t.is(connectedAccount2!.user.id, user.id);

  const updatedConnectedAccount = await t.context.user.updateConnectedAccount(
    connectedAccount.id,
    {
      accessToken: 'new-access-token',
    }
  );
  t.is(updatedConnectedAccount.accessToken, 'new-access-token');
  // get the updated connected account
  const connectedAccount3 = await t.context.user.getConnectedAccount(
    connectedAccount.provider,
    connectedAccount.providerAccountId
  );
  t.is(connectedAccount3!.accessToken, 'new-access-token');

  await t.context.user.deleteConnectedAccount(connectedAccount.id);
  const connectedAccount4 = await t.context.user.getConnectedAccount(
    connectedAccount.provider,
    connectedAccount.providerAccountId
  );
  t.is(connectedAccount4, null);
});

// #endregion
