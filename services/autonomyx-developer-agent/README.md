# autonomyx-developer-agent

**Claude acts strictly as a code reviewer** and delegates all implementation to **workers** running on a local model behind the LiteLLM gateway. Multiple workers can be spawned in parallel, each in an isolated workspace.

Integrates with **Slack** (`/review` slash command), **GitHub** (PR comment trigger), **VSCode** (inline command), and a direct **HTTP API**.

---

## Architecture

```
┌─ self-hosted on your VPS ─┐          ┌─ your infra ─┐
│                           │          │              │
│  FastAPI server           │          │ llm.open-    │
│   ├─ Claude (reviewer) ───┼─────────▶│ autonomyx    │─▶ Anthropic
│   └─ workers ───┼─────────▶│ .com         │─▶ local model
│                           │          │ (LiteLLM)    │
│  SQLite (session log)     │          │              │
└────┬──────────┬───────┬───┘          └──────┬───────┘
     │          │       │                     │
  Slack      GitHub   VSCode               spend logs
  bot        webhook  extension            (per tenant)
```

**Enforcement of "Claude only reviews" is three-layered:**

1. `disallowed_tools=["Write","Edit","NotebookEdit","Bash"]` — the runtime blocks write tools outright
2. `allowed_tools=["mcp__worker__*"]` — only MCP worker-control tools auto-approved
3. `can_use_tool` callback — gates `Read`/`Grep`/`Glob` to paths under `WORKSPACES_DIR`

---

## Quick start (local dev)

```bash
git clone <this-repo>
cd claude-worker-reviewer

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pip install PyJWT

cp .env.example .env
# edit .env — at minimum set ANTHROPIC_API_KEY, LLM_BASE_URL, LLM_API_KEY, WORKER_CMD

# CLI smoke test
.venv/bin/python main.py "add a /healthz endpoint in ./workspaces/test-project"

# OR start the HTTP server
.venv/bin/uvicorn server:app --reload
# → http://127.0.0.1:8080/docs for Swagger UI
```

---

## Deploy to VPS (Docker Compose)

```bash
# On your VPS
git clone <this-repo> /opt/claude-worker-reviewer
cd /opt/claude-worker-reviewer
cp .env.example .env
# edit .env with real tokens

docker compose up -d --build
docker compose logs -f reviewer
```

The compose file starts **two services**:

| Service | Purpose | Ports |
|---|---|---|
| `reviewer` | FastAPI HTTP server | 8080 (reverse-proxy this) |
| `slack-bot` | Socket Mode listener | none (outbound only) |

**Reverse proxy** the reviewer with Caddy/Nginx at `https://developers.agnxxt.com` (or your subdomain). The GitHub webhook needs this public URL.

### Caddy example

```caddyfile
developers.agnxxt.com {
    reverse_proxy 127.0.0.1:8080
}
```

---

## Environment variables

All config lives in `.env`. See `.env.example` for the full list. Grouped summary:

| Group | Variables | Notes |
|---|---|---|
| Claude | `ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, `ANTHROPIC_BASE_URL` | Set `ANTHROPIC_BASE_URL` to the gateway's Anthropic passthrough for unified tracking |
| Gateway | `GATEWAY_MODE`, `GATEWAY_URL`, `GATEWAY_VIRTUAL_KEY`, `GATEWAY_ADMIN_KEY` | `managed` = tracked, `byo` = no tracking |
| Worker | `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `WORKER_CMD`, `MAX_CONCURRENT_AGENTS`, `AGENT_TIMEOUT_SECONDS` | Workers use the gateway exclusively |
| Server | `HOST`, `PORT`, `PUBLIC_URL`, `DATABASE_PATH`, `WORKSPACES_DIR` | |
| Slack | `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_ALLOWED_CHANNELS` | Socket Mode, no public endpoint needed |
| GitHub | `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_PATH`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_TRIGGER_COMMAND` | Defaults to `/review` |

---

## LiteLLM gateway setup (managed mode)

Usage tracking works by routing **all** LLM traffic — Claude reviewer AND workers — through your LiteLLM gateway at `llm.openautonomyx.com`. LiteLLM logs every request per virtual key and per `user` tag.

### One-time: provision a virtual key per tenant

Using LiteLLM's admin API:

```bash
curl -X POST https://llm.openautonomyx.com/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key_alias": "tenant-acme-corp",
    "max_budget": 100.00,
    "budget_duration": "30d",
    "metadata": {"tenant": "acme-corp"}
  }'
```

Paste the returned `key` into the tenant's `.env` as `GATEWAY_VIRTUAL_KEY`.

### Route Claude through the gateway

LiteLLM supports Anthropic passthrough at `/anthropic`. In the tenant's `.env`:

```bash
ANTHROPIC_BASE_URL=https://llm.openautonomyx.com/anthropic
ANTHROPIC_API_KEY=${GATEWAY_VIRTUAL_KEY}
```

Claude (via the Anthropic Python client) respects `ANTHROPIC_BASE_URL` automatically.

### Query spend

```bash
curl https://developers.agnxxt.com/usage
```

This endpoint proxies `/spend/logs` on the gateway, scoped to the tenant's virtual key. Output includes per-session cost (tagged via `LITELLM_USER=review:<session_id>`).

---

## Integration setup

### Slack

1. Go to https://api.slack.com/apps → **Create New App** → From scratch.
2. **Socket Mode** → enable → generate an App-Level Token with `connections:write` → this is `SLACK_APP_TOKEN` (starts with `xapp-`).
3. **OAuth & Permissions** → add bot scopes: `chat:write`, `commands`, `app_mentions:read`.
4. **Install to Workspace** → copy the Bot User OAuth Token → this is `SLACK_BOT_TOKEN` (starts with `xoxb-`).
5. **Slash Commands** → create `/review` with description "Delegate a coding task to Worker and review with Claude". Request URL is ignored in Socket Mode — put any placeholder.
6. Paste both tokens into `.env`. Optionally set `SLACK_ALLOWED_CHANNELS=C0123,C0456` to restrict usage.
7. Restart the `slack-bot` container: `docker compose restart slack-bot`.

Usage in Slack:

```
/review implement rate limiting in the auth middleware
```

The bot replies with a threaded status message and posts streamed tool calls + final verdict back to the thread.

### GitHub

1. https://github.com/settings/apps → **New GitHub App**.
2. **Webhook URL**: `https://developers.agnxxt.com/webhooks/github` → **Webhook secret**: generate a strong random string → this is `GITHUB_WEBHOOK_SECRET`.
3. **Permissions**:
   - Pull requests: Read
   - Issues: Write (to post review comments)
   - Contents: Read
4. **Subscribe to events**: `Issue comment`.
5. After creating, click **Generate a private key** → download the `.pem` file → save on VPS as `./github-app.private-key.pem`.
6. Note the **App ID** from the app settings page.
7. Paste into `.env`:
   ```bash
   GITHUB_APP_ID=123456
   GITHUB_APP_PRIVATE_KEY_PATH=./github-app.private-key.pem
   GITHUB_WEBHOOK_SECRET=<the secret from step 2>
   ```
8. **Install the App** on any repo you want reviewed.
9. Restart reviewer: `docker compose restart reviewer`.

Usage on a PR:

```
/review please verify the new auth guards
```

The bot acks in the PR immediately, runs the review, then posts a follow-up comment with the structured JSON verdict.

### VSCode extension

Development:

```bash
cd integrations/vscode-extension
npm install
npm run compile
# open the folder in VSCode, press F5 to launch an Extension Development Host
```

Inside the Extension Development Host, open the command palette and run **Claude Worker: Delegate & Review**. Configure the server URL via `Settings → Claude Worker: Server Url` (defaults to `http://127.0.0.1:8080`).

Publish to Marketplace (optional):

```bash
npm install -g @vscode/vsce
vsce package       # produces .vsix
vsce publish       # requires a Marketplace PAT
```

---

## API reference

### `POST /review`

```json
{
  "task": "implement JWT refresh in api/auth.py",
  "source": "api",
  "source_meta": {"caller": "my-script"}
}
```

Returns `{"session_id": "rs-...", "status": "pending"}`. Review runs asynchronously.

### `GET /review/{session_id}`

Full session dump: metadata, all events, final result.

### `GET /review/{session_id}/events`

Server-sent events. Replays historical events, then streams live updates until the review completes.

```
event: message
data: {"type":"tool_call","name":"mcp__worker__spawn_worker","input":{...}}

event: message
data: {"type":"text","text":"Delegating to worker A..."}

event: done
data: {}
```

### `GET /sessions?limit=100`

Recent sessions ordered by creation time.

### `GET /usage`

Gateway spend proxy (managed mode only). Returns LiteLLM `/spend/logs` output scoped to the tenant's virtual key.

### `GET /health`

Liveness probe.

### `POST /webhooks/github`

GitHub App webhook receiver. Reject all events except `issue_comment` on PRs where the body starts with the trigger command.

---

## Review rubric

Claude applies the rubric defined in `review_criteria.py` to every Worker diff. Default rules (edit to taste):

1. **Best practices** — idiomatic code, no anti-patterns
2. **Tests** — new public functions need assertions
3. **Comments / docstrings** — public APIs documented
4. **Logic implemented** — no stubs, `TODO:`, or `NotImplementedError`
5. **CI/CD compatibility** — don't break existing workflows
6. **No large files** — ≤500 LOC per source file, ≤100 KB per asset

Output format is structured JSON per worker:

```json
{
  "agent_id": "oh-abc123",
  "decision": "APPROVED | CHANGES_REQUESTED | REJECTED",
  "failed_rules": [1, 3],
  "required_changes": ["add docstring to UserService.refresh()"],
  "notes": "..."
}
```

---

## Usage tracking details

Every review creates a `session_id`. The runner sets environment variables on each worker subprocess:

```
LITELLM_USER=review:<session_id>
LITELLM_METADATA={"session_id":"...","agent_id":"...","agent_name":"..."}
```

LiteLLM logs these on every request. The `/usage` endpoint queries the gateway for all records matching the tenant's virtual key, which includes both Claude-reviewer calls (tagged via `ANTHROPIC_BASE_URL` passthrough) and Worker-worker calls.

**Local SQLite stores metadata only** — task text, source, session status, events timeline, final verdict. Cost figures come from the gateway as the single source of truth.

---

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| `can_use_tool` never fires | Tool is in `allowed_tools`, auto-approved before callback | Remove from `allowed_tools` |
| Path denied for legitimate workspace files | `WORKSPACES_DIR` mismatch between runner and callback | Ensure both use the same resolved path |
| Worker subprocess hangs | Worker waiting on stdin (TTY) | Ensure `WORKER_CMD` runs in headless mode |
| GitHub webhook 401 | Signature mismatch | Verify `GITHUB_WEBHOOK_SECRET` matches the GitHub App config exactly |
| GitHub webhook 503 | Private key missing inside container | Check the `volumes:` mount in docker-compose resolves to a real file |
| Slack `/review` silent | Socket Mode disconnected | `docker compose logs slack-bot` — token likely wrong |
| `/usage` returns 503 | `GATEWAY_MODE=byo` or missing admin key | Set `GATEWAY_MODE=managed` and `GATEWAY_ADMIN_KEY` |
| Hook false-positive on Python subprocess code | Unrelated IDE/agent hook | Ignore; runner uses argv-list `create_subprocess_exec`, no shell |

---

## Scaling notes

Reviews are serialized per-process by an `asyncio.Lock`. For higher throughput:

1. Run multiple `reviewer` replicas behind a load balancer (HAProxy, Caddy, etc.).
2. Replace the in-process SSE pubsub (`_session_queues` in `server.py`) with Redis pub/sub.
3. Replace SQLite with Postgres (aiosqlite → asyncpg, ~1 hour of work).
4. workers already use Docker-friendly isolated workspaces; scale them horizontally via the `MAX_CONCURRENT_AGENTS` semaphore.

---

## Security posture

- All subprocess invocations use argv-based `asyncio.create_subprocess_exec` (no shell).
- HMAC-SHA256 verification on every GitHub webhook.
- GitHub App JWT is generated fresh per request (9-minute expiry).
- Claude read-path is restricted to `WORKSPACES_DIR` via `can_use_tool` callback.
- `.env` never committed (in `.gitignore`).
- Gateway admin key is server-side only; never exposed to tenants.
- SQLite DB stores task text — consider encrypting at rest if reviews include sensitive code.

---

## License

TBD — choose before publishing.
