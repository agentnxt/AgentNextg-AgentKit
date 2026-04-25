import './index.css';
import '@afk/component/theme';

import { ConfirmModalProvider } from '@afk/component';
import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router';

import { AuthGuard } from './components/auth-guard';
import { ChatPage } from './pages/chats/chat';
import { ChatPlaybackPage } from './pages/chats/chat-playback';
import { ChatsDashboard } from './pages/chats/chats-dashboard';
import { DocEditTest } from './pages/doc-edit-test';
import { DocPage } from './pages/doc-page';
import { HomePage } from './pages/home';
import { OALayout } from './pages/layout/chat-layout';
import { LibraryDashboard } from './pages/library-dashboard';
import { MagicLinkPage } from './pages/magic-link';
import { OAuthCallbackPage } from './pages/oauth-callback';
import { oauthLoginLoader, OAuthLoginPage } from './pages/oauth-login';
import { OnboardingPage } from './pages/onboarding';
import { redirectProxyLoader, RedirectProxyPage } from './pages/redirect';
import { SignInPage } from './pages/sign-in';
import { useOnboardingStore } from './store/onboarding';
import { useSidebarStore } from './store/sidebar';

const ChatsPage = () => {
  return (
    <Routes>
      <Route element={<OALayout />}>
        <Route index element={<ChatsDashboard />} />
        <Route path=":id" element={<ChatPage />} />
      </Route>

      <Route path=":id/playback" element={<ChatPlaybackPage />} />
    </Routes>
  );
};

const LibraryPage = () => {
  return (
    <Routes>
      <Route element={<OALayout />}>
        <Route path="/" element={<LibraryDashboard />} />
        <Route path="/:id" element={<DocPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  const navigate = useNavigate();
  const { open } = useSidebarStore();
  const { visited } = useOnboardingStore();

  useEffect(() => {
    if (!visited) {
      navigate('/onboarding');
    }
  }, [navigate, visited]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', open);
  }, [open]);

  return (
    <ConfirmModalProvider>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/magic-link" element={<MagicLinkPage />} />
        <Route
          path="/chats/*"
          element={
            <AuthGuard>
              <ChatsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/library/*"
          element={
            <AuthGuard>
              <LibraryPage />
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <div className="p-8">Settings (coming soon)</div>
            </AuthGuard>
          }
        />
        <Route path="/doc-edit-test" element={<DocEditTest />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />
        <Route
          path="/redirect-proxy"
          element={<RedirectProxyPage />}
          loader={redirectProxyLoader}
        />
        <Route
          path="/oauth/login"
          element={<OAuthLoginPage />}
          loader={oauthLoginLoader}
        />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      </Routes>
    </ConfirmModalProvider>
  );
}

export default App;
