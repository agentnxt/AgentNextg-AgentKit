import { render as rawRender } from '@react-email/components';

import TestMail from './test-mail';
import {
  ChangeEmail,
  ChangeEmailNotification,
  ChangePassword,
  Mention,
  SetPassword,
  SignIn,
  SignUp,
  VerifyChangeEmail,
  VerifyEmail,
} from './users';

type EmailContent = {
  subject: string;
  html: string;
};

function render(component: React.ReactElement) {
  return rawRender(component, {
    pretty: env.testing,
  });
}

type Props<T> = T extends React.ComponentType<infer P> ? P : never;
export type EmailRenderer<Props> = (props: Props) => Promise<EmailContent>;

function make<T extends React.ComponentType<any>>(
  Component: T,
  subject: string | ((props: Props<T>) => string)
): EmailRenderer<Props<T>> {
  return async props => {
    if (!props && env.testing) {
      // @ts-expect-error test only
      props = Component.PreviewProps;
    }
    return {
      subject: typeof subject === 'function' ? subject(props) : subject,
      html: await render(<Component {...props} />),
    };
  };
}

export const Renderers = {
  TestMail: make(TestMail, 'Test Email from Open-Agent'),
  SignIn: make(SignIn, 'Sign in to Open-Agent'),
  SignUp: make(SignUp, 'Your Open-Agent account is waiting for you!'),
  SetPassword: make(SetPassword, 'Set your Open-Agent password'),
  ChangePassword: make(ChangePassword, 'Modify your Open-Agent password'),
  VerifyEmail: make(VerifyEmail, 'Verify your email address'),
  ChangeEmail: make(ChangeEmail, 'Change your email address'),
  VerifyChangeEmail: make(VerifyChangeEmail, 'Verify your new email address'),
  EmailChanged: make(ChangeEmailNotification, 'Account email address changed'),
  Mention: make(
    Mention,
    props => `${props.user.email} mentioned you in ${props.doc.title}`
  ),
} as const;

export type MailName = keyof typeof Renderers;
export type MailProps<T extends MailName> = Parameters<
  (typeof Renderers)[T]
>[0];
