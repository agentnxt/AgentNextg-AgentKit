import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();

  // loader data from useLoaderData is not reactive, so that we can safely
  // assume the effect below is only triggered once
  const triggeredRef = useRef(false);

  const nav = useNavigate();

  useEffect(() => {
    if (triggeredRef.current) {
      return;
    }
    triggeredRef.current = true;

    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');

    if (!code || !stateStr) {
      nav('/sign-in?error=Invalid oauth callback parameters');
      return;
    }

    const { state, provider } = JSON.parse(stateStr);

    (async () => {
      const res = await fetch('/api/oauth/callback', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          code,
          state,
        }),
        headers: {
          'content-type': 'application/json',
        },
      });
      await res.json();
      nav('/');
    })();
  }, [nav, searchParams]);

  return null;
};
