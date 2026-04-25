import { Content, P, Template, Title } from './components';

export default function TestMail() {
  return (
    <Template>
      <Title>Test Email from Open-Agent</Title>
      <Content>
        <P>This is a test email from your Open-Agent instance.</P>
      </Content>
    </Template>
  );
}
