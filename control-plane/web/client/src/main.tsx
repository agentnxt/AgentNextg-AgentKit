import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider as OidcProvider } from 'react-oidc-context'
import type { AuthProviderProps } from 'react-oidc-context'
import { WebStorageStateStore } from 'oidc-client-ts'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.tsx'

const oidcAuthority = import.meta.env.VITE_OIDC_ISSUER as string | undefined;
const oidcClientId = import.meta.env.VITE_OIDC_CLIENT_ID as string | undefined;

const oidcConfig: AuthProviderProps | null = oidcAuthority && oidcClientId
  ? {
      authority: oidcAuthority,
      client_id: oidcClientId,
      redirect_uri: `${window.location.origin}${(import.meta.env.VITE_BASE_PATH || "/ui").replace(/\/$/, "")}/callback`,
      post_logout_redirect_uri: `${window.location.origin}${import.meta.env.VITE_BASE_PATH || "/ui"}`,
      scope: (import.meta.env.VITE_OIDC_SCOPES as string | undefined) || "openid profile email",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
      },
    }
  : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {oidcConfig ? (
      <OidcProvider {...oidcConfig}>
        <App />
      </OidcProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
