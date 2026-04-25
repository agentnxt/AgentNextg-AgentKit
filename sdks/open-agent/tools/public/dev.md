# Development Open Agent

## ⚙️ Quick Start

This project is a monorepo using Node.js, Yarn (Berry), NestJS, Rspack, and Rust. To run locally, you can install Docker and run the dependencies via Docker Compose.

#### Prerequisites

- Node.js 18–22 (engine: node < 23)
- Yarn 4 (Berry) — the repo sets `packageManager: yarn@4.9.1`
- Rust toolchain (for native packages)
- Docker + Docker Compose (Orbstack recommended)

#### 1) Install dependencies

```bash
yarn
```

#### 2) Start backend dependencies (Docker Compose)

Copy `.docker/dev/compose.yml.example` to `docker-compose.yml` (if you don’t have one).

Then:

```bash
docker compose -f ./.docker/dev/compose.yml up
```

#### 3) Configure environment

Defaults are sensible for local dev. You can export or add to a `.env` file at the repo root or `packages/backend/server/`.

```bash
# Example .env values for local development.
# Replace placeholder values with your own secrets as needed.

# Database connection string
DATABASE_URL="postgresql://open-agent:open-agent@localhost:5432/open-agent"

# Auth and web URLs
NEXTAUTH_URL="http://localhost:8080"

# Mailer configuration
MAILER_SENDER="noreply@example.com"
MAILER_USER="your_mail_user"
MAILER_PASSWORD="your_mail_password"
MAILER_HOST="localhost"
MAILER_PORT="1025"

# Stripe API keys (use your own test keys)
STRIPE_API_KEY=sk_test_your_stripe_api_key
STRIPE_WEBHOOK_KEY=whsec_your_stripe_webhook_key

# OAuth credentials (replace with your own)
OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Copilot/AI API keys (replace with your own)
COPILOT_OPENAI_API_KEY=your_openai_api_key
COPILOT_PERPLEXITY_API_KEY=your_perplexity_api_key
COPILOT_FAL_API_KEY=your_fal_api_key
COPILOT_GOOGLE_API_KEY=your_google_api_key
```

#### 4) Build Rust native bindings (once)

```bash
yarn oa @afk/server-native build
```

#### 5) Run database migrations and seed (optional)

From `packages/backend/server/` you can run Prisma flows as needed:

```bash
(cd packages/backend/server && yarn prisma migrate dev)
```

#### 6) Start local development

Run web and server together from the monorepo root:

```bash
yarn dev
```

- Web app: http://localhost:8080
- Server: http://localhost:3010 (GraphQL at `/graphql`)

You can also run individually:

```bash
yarn dev:web      # runs @afk/app (Rspack dev server on 8080)
yarn dev:server   # runs backend server (NestJS, listens on 3010 by default)
```

#### Notes

- If Node is outside the supported range, switch via `nvm`, `fnm`, or similar.
- If ports are taken, change `OPEN_AGENT_SERVER_PORT` or Rspack devServer port in `packages/frontend/app/rspack.config.js`.
- The web dev server proxies `/api` and `/graphql` to `http://localhost:3010` by default.
- When login, you may be prompted to verify your email. The code will be sent to the local mailhog server at `http://localhost:8025`.

---