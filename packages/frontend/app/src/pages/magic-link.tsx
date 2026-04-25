import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuthStore } from '../store/auth';

export const MagicLinkPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuthStore();

  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const email = params.get('email');
    const token = params.get('token');
    const redirectUri = params.get('redirect_uri') || '/';

    if (!email || !token) {
      navigate('/sign-in?error=Invalid%20magic%20link', { replace: true });
      return;
    }

    void auth
      .verifyMagicLink(email, token)
      .then(() => {
        navigate(redirectUri, { replace: true });
      })
      .catch(e => {
        navigate(`/sign-in?error=${encodeURIComponent(e.message)}`, {
          replace: true,
        });
      });
  }, [auth, navigate, params]);

  return null; // can add spinner later
};
