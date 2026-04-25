import { OAuthProviderType } from '@afk/graphql';
import { useEffect } from 'react';
import {
  type LoaderFunction,
  redirect,
  // oxlint-disable-next-line @typescript-eslint/no-restricted-imports
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { z } from 'zod';

const supportedProvider = z.nativeEnum(OAuthProviderType);

const oauthParameters = z.object({
  provider: supportedProvider,
  client: z.enum(['web']),
  redirectUri: z.string().optional().nullable(),
});

interface LoaderData {
  provider: OAuthProviderType;
  client: string;
  redirectUri?: string;
}

export const oauthLoginLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const provider = searchParams.get('provider');
  const client = searchParams.get('client') ?? 'web';
  const redirectUri = searchParams.get('redirect_uri');

  // sign out first, web only
  if (client === 'web') {
    await fetch('/api/auth/sign-out');
  }

  const paramsParseResult = oauthParameters.safeParse({
    provider,
    client,
    redirectUri,
  });

  if (paramsParseResult.success) {
    return {
      provider,
      client,
      redirectUri,
    };
  }

  return redirect(
    `/sign-in?error=${encodeURIComponent(`Invalid oauth parameters`)}`
  );
};

export const OAuthLoginPage = () => {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  // Parse parameters directly since we're not using a data router
  const provider = searchParams.get('provider') as OAuthProviderType | null;
  const client = searchParams.get('client') ?? 'web';
  const redirectUri = searchParams.get('redirect_uri') ?? undefined;

  const paramsParseResult = oauthParameters.safeParse({
    provider,
    client,
    redirectUri,
  });

  useEffect(() => {
    if (!paramsParseResult.success) {
      nav(`/sign-in?error=${encodeURIComponent('Invalid oauth parameters')}`);
      return;
    }

    const { provider, client, redirectUri } = paramsParseResult.data;

    const abortController = new AbortController();
    const signal = abortController.signal;

    (async () => {
      try {
        // sign out first for web clients
        if (client === 'web') {
          await fetch('/api/auth/sign-out');
        }

        const res = await fetch('/api/oauth/preflight', {
          method: 'POST',
          body: JSON.stringify({
            provider,
            client,
            redirect_uri: redirectUri,
          }),
          headers: {
            'content-type': 'application/json',
          },
          signal,
        });
        const { url } = await res.json();
        window.location.href = url;
      } catch (e) {
        nav(`/sign-in?error=${encodeURIComponent((e as any)?.message ?? e)}`);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [paramsParseResult, nav]);

  return null;
};
