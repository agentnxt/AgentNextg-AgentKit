import {
  changeEmailMutation,
  changePasswordMutation,
  deleteAccountMutation,
  getPublicUserByIdQuery,
  sendChangeEmailMutation,
  sendSetPasswordEmailMutation,
  sendVerifyChangeEmailMutation,
} from '@afk/graphql';

import { PublicUserType } from '../../core/user';
import { TestingApp } from './testing-app';

export async function currentUser(app: TestingApp) {
  const res = await app.gql(`
      query {
        currentUser {
          id, name, email, emailVerified, avatarUrl, hasPassword
        }
      }
    `);
  return res.currentUser;
}

export async function getPublicUserById(
  app: TestingApp,
  id: string
): Promise<PublicUserType | null> {
  const res = await app.typedGql({
    query: getPublicUserByIdQuery,
    variables: { id },
  });
  return res.publicUserById;
}

export async function sendChangeEmail(
  app: TestingApp,
  callbackUrl: string
): Promise<boolean> {
  const res = await app.typedGql({
    query: sendChangeEmailMutation,
    variables: { callbackUrl },
  });

  return res.sendChangeEmail;
}

export async function sendSetPasswordEmail(
  app: TestingApp,
  callbackUrl: string
): Promise<boolean> {
  const res = await app.typedGql({
    query: sendSetPasswordEmailMutation,
    variables: { callbackUrl },
  });

  return res.sendSetPasswordEmail;
}

export async function changePassword(
  app: TestingApp,
  userId: string,
  token: string,
  password: string
): Promise<boolean> {
  const res = await app.typedGql({
    query: changePasswordMutation,
    variables: { token, userId, newPassword: password },
  });

  return res.changePassword;
}

export async function sendVerifyChangeEmail(
  app: TestingApp,
  token: string,
  email: string,
  callbackUrl: string
): Promise<boolean> {
  const res = await app.typedGql({
    query: sendVerifyChangeEmailMutation,
    variables: { token, email, callbackUrl },
  });

  return res.sendVerifyChangeEmail;
}

export async function changeEmail(
  app: TestingApp,
  token: string,
  email: string
) {
  const res = await app.typedGql({
    query: changeEmailMutation,
    variables: { token, email },
  });

  return res.changeEmail;
}

export async function deleteAccount(app: TestingApp) {
  const res = await app.typedGql({
    query: deleteAccountMutation,
  });

  return res.deleteAccount.success;
}

export async function updateAvatar(app: TestingApp, avatar: Buffer) {
  return app
    .POST('/graphql')
    .field(
      'operations',
      JSON.stringify({
        name: 'uploadAvatar',
        query: `mutation uploadAvatar($avatar: Upload!) {
      uploadAvatar(avatar: $avatar) {
        avatarUrl
      }
    }`,
        variables: { avatar: null },
      })
    )
    .field('map', JSON.stringify({ '0': ['variables.avatar'] }))
    .attach('0', avatar, {
      filename: 'test.png',
      contentType: 'image/png',
    });
}
