import { Button, RowInput } from '@afk/component';
import { submitWishlistMutation } from '@afk/graphql';
import { GithubDuotoneIcon } from '@blocksuite/icons/rc';
import { type HTMLAttributes, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { gql } from '@/lib/gql';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { OnboardingStep, useOnboardingStore } from '../../store/onboarding';
import { AuthLayout as OnboardingLayout } from '../layout/auth-layout';
import { MultiAgentPreview } from './assets/multi-agent-preview';
import { TodoListPreview } from './assets/todo-list-preview';
import { EnterAnim } from './enter-anim';
import { LeaveAnim } from './leave-anim';
import { OnboardingNext } from './onboarding-next';
import { ShowCaseVideo } from './show-case-video';

interface StepProps {
  onNext?: () => void;
  onPrev?: () => void;
  onNavigate?: (step: OnboardingStep) => void;
}
const Logo = () => (
  <div
    className={cn(
      'size-[55px] bg-white rounded-full shadow-view',
      'flex items-center justify-center',
      'mb-6'
    )}
  >
    <img src="/logo.svg" alt="Open Agent" />
  </div>
);

const WelcomeStep: React.FC<StepProps> = ({ onNext }) => {
  const [show, setShow] = useState(true);
  return (
    <LeaveAnim
      show={show}
      onAnimationEnd={() => onNext?.()}
      className="flex flex-col items-center"
    >
      <EnterAnim
        items={[
          <Logo />,
          <h1 className="onboarding-title">Welcome to OpenAgent</h1>,
          <p className="onboarding-caption">
            Chat with all the frontier models and our multi-agent will have the
            job done
          </p>,
          <OnboardingNext className="mt-4" onClick={() => setShow(false)}>
            Get Started
          </OnboardingNext>,
        ]}
      />
    </LeaveAnim>
  );
};

const MultiAgentStep: React.FC<StepProps> = ({ onNext }) => {
  const [show, setShow] = useState(true);
  return (
    <LeaveAnim
      className="flex flex-col items-center"
      show={show}
      onAnimationEnd={() => onNext?.()}
    >
      <EnterAnim
        items={[
          <h1 className="onboarding-title">
            Multi-agent that collaborate together
          </h1>,
          <p className="onboarding-caption">
            Instead of chatting with singluar AI, all the frontier models
            collaborate together to finish your task with our multi-agents
          </p>,
          <MultiAgentPreview />,
          <OnboardingNext onClick={() => setShow(false)} className="mt-8">
            Continue
          </OnboardingNext>,
        ]}
      />
    </LeaveAnim>
  );
};

const TodoListStep: React.FC<StepProps> = ({ onNext }) => {
  const [show, setShow] = useState(true);

  return (
    <LeaveAnim
      className="flex flex-col items-center"
      show={show}
      onAnimationEnd={() => onNext?.()}
    >
      <EnterAnim
        items={[
          <h1 className="onboarding-title">
            Stop prompt‑chasing. Start decision‑making
          </h1>,
          <p className="onboarding-caption">
            Spec & context engineering give agents structure to plan, score, and
            surface options. You stay in control of the final call. Achieve
            more, struggle less.
          </p>,
          <TodoListPreview />,
          <OnboardingNext onClick={() => setShow(false)} className="mt-8">
            Continue
          </OnboardingNext>,
        ]}
      />
    </LeaveAnim>
  );
};

const ShowcaseStep: React.FC<StepProps> = ({ onNext }) => {
  const [show, setShow] = useState(true);
  return (
    <LeaveAnim
      className="flex flex-col items-center"
      onAnimationEnd={() => onNext?.()}
      show={show}
    >
      <EnterAnim
        items={[
          <h1 className="onboarding-title">
            See what OpenAgent can do for you
          </h1>,
          <p className="onboarding-caption mb-4">
            Spec & context engineering give agents structure to plan, score, and
            surface options. You stay in control of the final call. Achieve
            more, struggle less.
          </p>,
          <ShowCaseVideo />,
          <OnboardingNext className="mt-8" onClick={() => setShow(false)}>
            Continue
          </OnboardingNext>,
        ]}
      />
    </LeaveAnim>
  );
};

const SelectCard = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'p-6 border shadow-view rounded-2xl bg-white w-100 max-w-full',
        'hover:bg-[#fcfcfc] cursor-pointer transition-all',
        'flex flex-col gap-2',
        className
      )}
      {...props}
    />
  );
};

const SelectStep: React.FC<StepProps> = ({ onNext }) => {
  const [show] = useState(true);
  return (
    <LeaveAnim
      className="flex flex-col items-center"
      show={show}
      onAnimationEnd={() => onNext?.()}
    >
      <EnterAnim
        items={[
          <Logo />,
          <h1 className="onboarding-title">Ready to experience OpenAgent!?</h1>,
          <p className="onboarding-caption">
            Spec & context engineering give agents structure to plan, score, and
            surface options. You stay in control of the final call. Achieve
            more, struggle less.
          </p>,
          <div className="flex items-stretch gap-4 w-full max-w-[816px] flex-wrap justify-center">
            {/* <SelectCard onClick={() => setShow(false)}>
              <CollaborationIcon className="size-6 text-icon-primary" />
              <p className="text-text-primary font-semibold text-lg leading-[26px]">
                Register and Join Waiting List
              </p>
              <p className="text-sm text-text-secondary leading-[22px]">
                Get early access to development version, no configuration
                required
              </p>
              <ul className="text-text-primary">
                <li>✓ &nbsp;First-time notification of product releases</li>
                <li>✓ &nbsp;Free real conversation replay</li>
                <li>✓ &nbsp;Priority access to new features</li>
              </ul>
            </SelectCard> */}
            <a href="https://github.com/AFK-surf/open-agent" target="_blank">
              <SelectCard className="h-full">
                <GithubDuotoneIcon className="size-6 text-icon-primary" />
                <p className="text-text-primary font-semibold text-lg leading-[26px]">
                  GitHub Self-deployment
                </p>
                <p className="text-sm text-text-secondary leading-[22px]">
                  Fully open source, start using immediately
                </p>
                <ul className="text-text-primary">
                  <li>✓ &nbsp;View complete source code</li>
                  <li>✓ &nbsp;Customize configuration as needed</li>
                  <li>✓ &nbsp;Participate in open source contributions</li>
                </ul>
              </SelectCard>
            </a>
          </div>,
        ]}
      />
    </LeaveAnim>
  );
};

const RegisterStep: React.FC<StepProps> = ({ onPrev, onNext }) => {
  const { setVisited } = useOnboardingStore();
  const navigate = useNavigate();
  const { checkUserByEmail } = useAuthStore();
  const [show, setShow] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dir, setDir] = useState<'next' | 'prev'>('next');

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (loading) return;

    setLoading(true);

    // 1. submit
    try {
      await gql({
        query: submitWishlistMutation,
        variables: { email },
      });
    } catch (err) {
      console.error(err);
      setError('Failed to submit wishlist');
      setLoading(false);
      return;
    }
    setVisited(true);

    // 2. if submitted, check if in early access
    try {
      const info = await checkUserByEmail(email);
      if (info.canSignIn) {
        navigate('/sign-in');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to check user');
      return;
    } finally {
      setLoading(false);
    }

    // 3. if not submitted, or in waiting list
    setLoading(false);
    setDir('next');
    setShow(false);
  };

  return (
    <LeaveAnim
      className="flex flex-col items-center"
      show={show}
      onAnimationEnd={() => {
        dir === 'next' ? onNext?.() : onPrev?.();
      }}
    >
      <EnterAnim
        items={[
          <Logo />,
          <h1 className="onboarding-title">Register and Join Waiting List</h1>,
          <p className="onboarding-caption">
            Get early access to development version, no configuration required
          </p>,
          <div
            className={cn(
              'w-[440px] max-w-full-screen p-6 flex flex-col items-start',
              'border bg-white shadow-view rounded-2xl',
              'mb-8'
            )}
          >
            <form onSubmit={handleSubmit} className="w-full">
              <label className="text-xs text-text-secondary">Email</label>
              <RowInput
                placeholder="Enter your email"
                style={{
                  height: 40,
                  fontSize: 14,
                  fontWeight: 500,
                }}
                value={email}
                onChange={e => setEmail(e)}
                required
                autoFocus
                type="email"
                className="border w-full rounded-lg mt-1 px-2 outline-black"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}

              <Button
                {...{ type: 'submit' }}
                className="mt-6"
                size="large"
                style={{ width: '100%', height: 40, backgroundColor: 'black' }}
                disabled={!email}
                variant="primary"
              >
                Submit
              </Button>
            </form>
          </div>,
          <Button
            onClick={() => {
              setDir('prev');
              setShow(false);
            }}
            style={{
              height: 40,
              width: 200,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Back
          </Button>,
        ]}
      />
    </LeaveAnim>
  );
};

const WaitingStep: React.FC<StepProps> = () => {
  return (
    <EnterAnim
      items={[
        <Logo />,
        <h1 className="onboarding-title">You’re on the waitlist!</h1>,
        <p className="onboarding-caption">
          We have added you to the waiting list. If you pass, we will notify you
          by email as soon as possible.
        </p>,
      ]}
    />
  );
};

export const OnboardingPage: React.FC = () => {
  const { step, nextStep, prevStep } = useOnboardingStore();

  const el = useMemo(() => {
    switch (step) {
      case OnboardingStep.Welcome:
        return <WelcomeStep onNext={nextStep} />;
      case OnboardingStep.MultiAgent:
        return <MultiAgentStep onNext={nextStep} onPrev={prevStep} />;
      case OnboardingStep.TodoList:
        return <TodoListStep onNext={nextStep} onPrev={prevStep} />;
      case OnboardingStep.Showcase:
        return <ShowcaseStep onNext={nextStep} onPrev={prevStep} />;
      case OnboardingStep.Select:
        return <SelectStep onNext={nextStep} onPrev={prevStep} />;
      case OnboardingStep.Register:
        return <RegisterStep onPrev={prevStep} onNext={nextStep} />;
      case OnboardingStep.Waiting:
        return <WaitingStep />;
      default:
        return null;
    }
  }, [step, nextStep, prevStep]);

  return <OnboardingLayout>{el}</OnboardingLayout>;
};
