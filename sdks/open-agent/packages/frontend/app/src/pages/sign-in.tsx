import { Button, RowInput } from '@afk/component';
import { OAuthProviderType } from '@afk/graphql';
import { GithubDuotoneIcon, GoogleDuotoneIcon } from '@blocksuite/icons/rc';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactCodeInput from 'react-verification-code-input';

import { cn } from '@/lib/utils';

import { useAuthStore } from '../store/auth';
import { AuthLayout } from './layout/auth-layout';
import * as styles from './sign-in.css';

type Step = 'methodSelect' | 'password' | 'magic';

interface OAuthButtonProps {
  provider: OAuthProviderType;
  redirectUrl?: string;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, redirectUrl }) => {
  const handleClick = async () => {
    // Call preflight to get redirect URL (fallback to /oauth/login)
    try {
      const res = await fetch(`/api/oauth/preflight`, {
        method: 'POST',
        body: JSON.stringify({
          provider,
          client: 'web',
          redirect_uri: redirectUrl,
        }),
        headers: {
          'content-type': 'application/json',
        },
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        // fallback – many providers accept this path directly
        window.location.href = `/api/oauth/${provider}?redirect_uri=${encodeURIComponent(
          redirectUrl || window.location.origin + '/oauth/callback'
        )}`;
      }
      // const params = new URLSearchParams();

      // params.set('provider', provider);

      // if (redirectUrl) {
      //   params.set('redirect_uri', redirectUrl);
      // }

      // const origin = window.location.origin;
      // const oauthUrl = `${origin}/oauth/login?${params.toString()}`;

      // openPopupWindow(oauthUrl);
    } catch {
      window.location.href = `/api/oauth/${provider}`;
    }
  };

  const icon =
    (
      {
        [OAuthProviderType.Google]: <GoogleDuotoneIcon />,
        [OAuthProviderType.GitHub]: <GithubDuotoneIcon />,
      } as any
    )[provider] ?? null;

  return (
    <button onClick={handleClick} className={styles.oauthButton}>
      {icon}
      Continue with {provider}
    </button>
  );
};

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  const {
    user,
    isLoading,
    error,
    clearError,
    checkUserByEmail,
    signInPassword,
    sendMagicLink,
    verifyMagicLink,
  } = useAuthStore();

  // Local UI state
  const [step, setStep] = useState<Step>('methodSelect');
  const [email, setEmail] = useState('');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Navigate after login effect
  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isLoading, navigate, redirectUrl, user]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleEmailContinue = async () => {
    clearError();
    if (!email) return;
    try {
      const info = await checkUserByEmail(email);
      setHasPassword(info.hasPassword);
      if (!info.canSignIn) {
        return;
      } else if (info.hasPassword) {
        setStep('password');
      } else {
        // automatically send magic link
        await sendMagicLink(email, { redirectUrl });
        setCooldown(60);
        setStep('magic');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordLogin = async () => {
    clearError();
    try {
      await signInPassword(email, password);
      navigate(redirectUrl, { replace: true });
    } catch {
      /* handled by store */
    }
  };

  const handleVerifyOtp = async () => {
    clearError();
    if (otp.length !== 6) return;
    try {
      await verifyMagicLink(email, otp);
      navigate(redirectUrl, { replace: true });
    } catch {}
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;
    await sendMagicLink(email, { redirectUrl });
    setCooldown(60);
  };

  return (
    <AuthLayout>
      <div className={styles.wrapper}>
        {step === 'methodSelect' && (
          <>
            <h2 className={styles.title}>Welcome Back</h2>
            <RowInput
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => {
                setEmail(e);
                clearError();
              }}
              className={cn(
                styles.input,
                'px-2 py-1',
                error ? 'border-red-600!' : 'border-black!',
                'outline-black'
              )}
              autoComplete="email"
              required
              autoFocus
              onEnter={() => void handleEmailContinue()}
            />
            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[15px] text-red-600 mt-2 font-medium">
                    {error}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <button
              onClick={() => void handleEmailContinue()}
              className={cn(styles.submit, 'mt-4')}
              disabled={!email || isLoading}
              aria-disabled={!email || isLoading}
            >
              Continue with email
            </button>
            <div className={styles.or}>
              <div className={cn('flex-1', styles.line)} />
              <span className={styles.orText}>OR</span>
              <div className={cn('flex-1', styles.line, 'reverse')} />
            </div>
            <OAuthButton provider={OAuthProviderType.Google} />
          </>
        )}

        {step === 'password' && (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">
              Enter Password
            </h2>
            <p className="text-sm mb-2 text-gray-700">{email}</p>
            <input
              type="password"
              autoFocus
              placeholder="Password"
              className="w-full px-3 py-2 border rounded mb-3"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <button
              onClick={() => void handlePasswordLogin()}
              className={cn(styles.submit, 'mt-8')}
              disabled={!password || isLoading}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                void (async () => {
                  await sendMagicLink(email, { redirectUrl });
                  setCooldown(60);
                  setStep('magic');
                })();
              }}
              className="mt-3 w-full text-sm text-indigo-600 hover:underline"
            >
              Use a 6-digit code instead
            </button>
          </>
        )}

        {step === 'magic' && (
          <>
            <h2 className={styles.title}>Verify your email</h2>
            <p className={styles.hit}>
              We've sent to a security code to <br />
              <span className={styles.hitEmail}>{email}</span>, please enter the
              code
            </p>
            <div className="flex justify-center mt-8">
              <ReactCodeInput
                className={styles.codeInput}
                values={otp.split('')}
                onChange={setOtp}
                fieldWidth={43}
                fieldHeight={43}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            {/* resend code */}
            <div className="flex justify-center mt-4">
              <Button onClick={() => void resendOtp()} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </Button>
            </div>

            <button
              onClick={() => void handleVerifyOtp()}
              className={cn(styles.submit, 'mt-8')}
              disabled={otp.length !== 6 || isLoading}
              aria-disabled={otp.length !== 6 || isLoading}
            >
              Verify & Sign in
            </button>

            {hasPassword && (
              <button
                onClick={() => setStep('password')}
                className="mt-2 w-full text-sm text-indigo-600 hover:underline"
              >
                Use password instead
              </button>
            )}

            <div
              onClick={() => setStep('methodSelect')}
              className={cn('mt-4', styles.oauthButton)}
            >
              Back
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
