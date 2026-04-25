import { useEffect, useMemo } from 'react';
import {
  type LoaderFunction,
  Navigate,
  useSearchParams,
} from 'react-router-dom';

const trustedDomain = [
  'google.com',
  'stripe.com',
  'github.com',
  'twitter.com',
  'discord.gg',
  'youtube.com',
  't.me',
  'reddit.com',
];

/**
 * /redirect-proxy page
 *
 * only for web
 */
export const redirectProxyLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const redirectUri = searchParams.get('redirect_uri');

  if (!redirectUri) {
    return { allow: false };
  }

  try {
    const target = new URL(redirectUri);

    if (
      target.hostname === window.location.hostname ||
      trustedDomain.some(domain =>
        new RegExp(`.?${domain}$`).test(target.hostname)
      )
    ) {
      location.href = redirectUri;
      return { allow: true };
    }
  } catch (e) {
    return { allow: false };
  }

  return { allow: true };
};

export const RedirectProxyPage = () => {
  const [searchParams] = useSearchParams();

  const redirectUri = searchParams.get('redirect_uri');

  const allow = useMemo(() => {
    if (!redirectUri) return false;

    try {
      const target = new URL(redirectUri);

      if (
        target.hostname === window.location.hostname ||
        trustedDomain.some(domain =>
          new RegExp(`.?${domain}$`).test(target.hostname)
        )
      ) {
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }, [redirectUri]);

  useEffect(() => {
    if (allow && redirectUri) {
      location.href = redirectUri;
    }
  }, [allow, redirectUri]);

  if (allow) {
    return null;
  }

  return <Navigate to="/404" />;
};
