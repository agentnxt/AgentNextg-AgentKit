import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentNodeIcon, CheckCircle, Copy, Settings, ShieldCheck } from "@/components/ui/icon-bridge";

type SetupDraft = {
  controlPlaneUrl: string;
  uiOrigin: string;
  basePath: string;
  keycloakOrigin: string;
  realm: string;
  uiClientId: string;
  apiAudience: string;
  adminScope: string;
  oidcEnabled: boolean;
  apiKeyEnabled: boolean;
};

const STORAGE_KEY = "agentfield_setup_draft_v1";

const defaultDraft: SetupDraft = {
  controlPlaneUrl: "http://localhost:8080",
  uiOrigin: "http://localhost:5173",
  basePath: "/ui",
  keycloakOrigin: "http://localhost:8081",
  realm: "agentfield",
  uiClientId: "agentfield-ui",
  apiAudience: "agentfield-api",
  adminScope: "admin",
  oidcEnabled: true,
  apiKeyEnabled: false,
};

export function SetupPage() {
  const [draft, setDraft] = useState<SetupDraft>(defaultDraft);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as Partial<SetupDraft>;
      setDraft((current) => ({ ...current, ...parsed }));
    } catch {
      // Ignore invalid local state and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const derived = useMemo(() => {
    const normalizedBasePath = normalizeBasePath(draft.basePath);
    const issuer = `${trimTrailingSlash(draft.keycloakOrigin)}/realms/${draft.realm}`;
    const callbackUrl = `${trimTrailingSlash(draft.uiOrigin)}${normalizedBasePath}/callback`;
    const appUrl = `${trimTrailingSlash(draft.controlPlaneUrl)}${normalizedBasePath}`;
    const jwksUrl = `${issuer}/protocol/openid-connect/certs`;

    return {
      normalizedBasePath,
      issuer,
      callbackUrl,
      appUrl,
      jwksUrl,
      clientEnv: [
        `VITE_OIDC_ISSUER=${issuer}`,
        `VITE_OIDC_CLIENT_ID=${draft.uiClientId}`,
        `VITE_OIDC_SCOPES=openid profile email`,
        `VITE_BASE_PATH=${normalizedBasePath}`,
      ].join("\n"),
      serverEnv: [
        `AGENTFIELD_API_AUTH_OIDC_ENABLED=${draft.oidcEnabled ? "true" : "false"}`,
        `AGENTFIELD_API_AUTH_OIDC_ISSUER=${issuer}`,
        `AGENTFIELD_API_AUTH_OIDC_AUDIENCE=${draft.apiAudience}`,
        `AGENTFIELD_API_AUTH_OIDC_ADMIN_SCOPE=${draft.adminScope}`,
        `AGENTFIELD_API_AUTH_OIDC_JWKS_URL=${jwksUrl}`,
        `AGENTFIELD_API_KEY=${draft.apiKeyEnabled ? "replace-me" : ""}`,
      ].join("\n"),
      yaml: [
        "api:",
        "  auth:",
        `    api_key: ${draft.apiKeyEnabled ? '"replace-me"' : '""'}`,
        "    skip_paths: []",
        "    oidc:",
        `      enabled: ${draft.oidcEnabled ? "true" : "false"}`,
        `      issuer: "${issuer}"`,
        `      jwks_url: "${jwksUrl}"`,
        `      audience: "${draft.apiAudience}"`,
        `      admin_scope: "${draft.adminScope}"`,
      ].join("\n"),
      compose: [
        'version: "3.9"',
        "",
        "services:",
        "  keycloak:",
        "    image: quay.io/keycloak/keycloak:25.0",
        "    command: start-dev",
        "    ports:",
        '      - "8081:8080"',
        "    environment:",
        "      KEYCLOAK_ADMIN: admin",
        "      KEYCLOAK_ADMIN_PASSWORD: admin",
      ].join("\n"),
      nextSteps: [
        `1. Create realm \`${draft.realm}\` in Keycloak.`,
        `2. Create public client \`${draft.uiClientId}\` with redirect URI \`${callbackUrl}\`.`,
        `3. Add web origins \`${trimTrailingSlash(draft.uiOrigin)}\` and \`${trimTrailingSlash(draft.controlPlaneUrl)}\`.`,
        `4. Add audience mapper for \`${draft.apiAudience}\`.`,
        `5. Add role or scope \`${draft.adminScope}\` for admin operators.`,
        `6. Start AgentField and open ${appUrl}.`,
      ],
    };
  }, [draft]);

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1800);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-border/60 bg-background/80">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Setup</Badge>
              <Badge variant="outline">Keycloak + OIDC</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl tracking-tight">AgentField setup studio</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6">
                Configure the control plane, Keycloak realm, UI client, and OIDC server settings in one place.
                This page generates the exact values you can paste into your client env, server env, and
                `agentfield.yaml`.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={<AgentNodeIcon className="size-4" />}
                title="Control Plane"
                value={draft.controlPlaneUrl}
                hint="Base URL for the AgentField server"
              />
              <SummaryCard
                icon={<ShieldCheck className="size-4" />}
                title="Issuer"
                value={derived.issuer}
                hint="OIDC issuer used by the UI and API"
              />
              <SummaryCard
                icon={<ShieldCheck className="size-4" />}
                title="Client"
                value={draft.uiClientId}
                hint="Public OIDC client for the browser app"
              />
              <SummaryCard
                icon={<Settings className="size-4" />}
                title="Callback"
                value={derived.callbackUrl}
                hint="Redirect URI to register in Keycloak"
              />
            </div>

            <Alert>
              <AlertTitle>Provider-agnostic OIDC is enabled</AlertTitle>
              <AlertDescription>
                The app now uses generic OIDC config rather than a vendor-specific auth path. Keycloak values are
                prefilled here, but the same shape works for any standards-compliant provider.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Launch checklist</CardTitle>
            <CardDescription>Use this as the install sequence for a local setup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {derived.nextSteps.map((step) => (
              <div key={step} className="flex items-start gap-3 rounded-lg border border-border/60 px-3 py-3">
                <CheckCircle className="mt-0.5 size-4 text-status-success" />
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform</CardTitle>
              <CardDescription>Define where the control plane and UI live.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field
                label="Control plane URL"
                value={draft.controlPlaneUrl}
                onChange={(value) => updateDraft(setDraft, "controlPlaneUrl", value)}
                placeholder="http://localhost:8080"
              />
              <Field
                label="UI origin"
                value={draft.uiOrigin}
                onChange={(value) => updateDraft(setDraft, "uiOrigin", value)}
                placeholder="http://localhost:5173"
              />
              <Field
                label="Base path"
                value={draft.basePath}
                onChange={(value) => updateDraft(setDraft, "basePath", value)}
                placeholder="/ui"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keycloak</CardTitle>
              <CardDescription>Realm, issuer, and audience details for the OIDC provider.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field
                label="Keycloak origin"
                value={draft.keycloakOrigin}
                onChange={(value) => updateDraft(setDraft, "keycloakOrigin", value)}
                placeholder="http://localhost:8081"
              />
              <Field
                label="Realm"
                value={draft.realm}
                onChange={(value) => updateDraft(setDraft, "realm", value)}
                placeholder="agentfield"
              />
              <Field
                label="UI client ID"
                value={draft.uiClientId}
                onChange={(value) => updateDraft(setDraft, "uiClientId", value)}
                placeholder="agentfield-ui"
              />
              <Field
                label="API audience"
                value={draft.apiAudience}
                onChange={(value) => updateDraft(setDraft, "apiAudience", value)}
                placeholder="agentfield-api"
              />
              <Field
                label="Admin scope"
                value={draft.adminScope}
                onChange={(value) => updateDraft(setDraft, "adminScope", value)}
                placeholder="admin"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Auth mode</CardTitle>
              <CardDescription>Choose whether OIDC and legacy API key auth stay enabled.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ToggleRow
                title="OIDC bearer auth"
                description="Enable JWT bearer-token validation on the Go API."
                checked={draft.oidcEnabled}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, oidcEnabled: checked }))}
              />
              <ToggleRow
                title="API key fallback"
                description="Keep static API-key auth available for local or scripted access."
                checked={draft.apiKeyEnabled}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, apiKeyEnabled: checked }))}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated output</CardTitle>
            <CardDescription>Copy-paste these snippets directly into your local setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="client-env" className="space-y-4">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 md:grid-cols-5">
                <TabsTrigger value="client-env">Client env</TabsTrigger>
                <TabsTrigger value="server-env">Server env</TabsTrigger>
                <TabsTrigger value="yaml">YAML</TabsTrigger>
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="redirects">Redirects</TabsTrigger>
              </TabsList>

              <OutputTab
                value="client-env"
                title="Client environment"
                code={derived.clientEnv}
                copied={copied === "client-env"}
                onCopy={() => handleCopy("client-env", derived.clientEnv)}
              />
              <OutputTab
                value="server-env"
                title="Server environment"
                code={derived.serverEnv}
                copied={copied === "server-env"}
                onCopy={() => handleCopy("server-env", derived.serverEnv)}
              />
              <OutputTab
                value="yaml"
                title="agentfield.yaml"
                code={derived.yaml}
                copied={copied === "yaml"}
                onCopy={() => handleCopy("yaml", derived.yaml)}
              />
              <OutputTab
                value="compose"
                title="Docker Compose"
                code={derived.compose}
                copied={copied === "compose"}
                onCopy={() => handleCopy("compose", derived.compose)}
              />

              <TabsContent value="redirects" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium">Keycloak client values</h3>
                    <p className="text-sm text-muted-foreground">
                      Register these exact redirect URIs and origins in your Keycloak client.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        "redirects",
                        [
                          `Redirect URI: ${derived.callbackUrl}`,
                          `Web Origin: ${trimTrailingSlash(draft.uiOrigin)}`,
                          `Web Origin: ${trimTrailingSlash(draft.controlPlaneUrl)}`,
                          `JWKS URL: ${derived.jwksUrl}`,
                        ].join("\n"),
                      )
                    }
                  >
                    {copied === "redirects" ? <CheckCircle className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    {copied === "redirects" ? "Copied" : "Copy values"}
                  </Button>
                </div>
                <Separator />
                <ValueList
                  values={[
                    { label: "Redirect URI", value: derived.callbackUrl },
                    { label: "UI origin", value: trimTrailingSlash(draft.uiOrigin) },
                    { label: "Control plane origin", value: trimTrailingSlash(draft.controlPlaneUrl) },
                    { label: "JWKS URL", value: derived.jwksUrl },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  hint,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-[0.18em]">{title}</span>
      </div>
      <div className="space-y-2">
        <p className="break-all text-sm font-medium leading-5">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function OutputTab({
  value,
  title,
  code,
  copied,
  onCopy,
}: {
  value: string;
  title: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <TabsContent value={value} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">Generated from the form inputs on this page.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onCopy}>
          {copied ? <CheckCircle className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-border/60 bg-muted/50 p-4 text-xs leading-6 text-foreground">
        {code}
      </pre>
    </TabsContent>
  );
}

function ValueList({ values }: { values: Array<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3">
      {values.map((item) => (
        <div key={item.label} className="rounded-lg border border-border/60 px-3 py-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
          <code className="break-all text-xs">{item.value}</code>
        </div>
      ))}
    </div>
  );
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function normalizeBasePath(value: string) {
  const trimmed = value.trim() || "/ui";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/$/, "");
}

function updateDraft(
  setDraft: Dispatch<SetStateAction<SetupDraft>>,
  key: keyof SetupDraft,
  value: string,
) {
  setDraft((current) => ({ ...current, [key]: value }));
}
