import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Loader2 } from "lucide-react";

export function OidcCallback() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    const basePath = import.meta.env.VITE_BASE_PATH || "/ui";
    if (auth.error) {
      console.error("OIDC callback failed", auth.error);
      return;
    }

    window.history.replaceState({}, document.title, `${basePath.replace(/\/$/, "")}/`);
    window.location.assign(basePath);
  }, [auth.error, auth.isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">{auth.error ? "Sign-in failed" : "Finishing sign-in…"}</span>
      </div>
    </div>
  );
}
