import { DocProps, UserProps } from './components';
import { WorkspaceProps } from './components/workspace';

export const TEST_USER: UserProps = {
  email: 'test@test.com',
};

export const TEST_WORKSPACE: WorkspaceProps = {
  name: 'Test Workspace',
  avatar: 'https://open-agent.io/assets/icons/logo.svg',
};

export const TEST_DOC: DocProps = {
  title: 'Test Doc',
  url: 'https://open-agent.io',
};
