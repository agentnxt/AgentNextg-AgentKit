# CodeReviewer Production Review

## Summary of changes
- Added production-oriented CodeReviewer app with shared core models, service, storage, API, and web surface.
- Added runtime provider/model profile UX and provider-model compatibility validation.
- Added starter surface adapters for Desktop/Mobile/VSCode/Slack/GitHub/Chrome.

## Files changed
- `apps/code-reviewer/**`
- `docs/products/code-reviewer*.md`
- `deploy/code-reviewer/docker-compose.yml`

## Risks
- Claude Agent SDK integration point currently deterministic/heuristic; external provider execution is deferred.
- File-based persistence is not suitable for high-scale multi-tenant operations.

## Deferred items
- Queue-based async review workers
- authn/authz and tenancy
- durable relational persistence
- provider-specific credential rotation

## Common-layer improvements suggested or implemented
- Implemented reusable review domain model with strict enums to avoid per-surface divergence.
- Follow-up: extract shared persistence abstraction if additional products need common registry storage.

## Surface-specific follow-up work
- Desktop/Mobile: shell and auth/session flow.
- VS Code: inline diagnostics rendering.
- Slack/GitHub: event/webhook bridge and notification workflows.
- Chrome: browser context capture and secure redaction.

## Provider/model/runtime gaps still remaining
- Real-time model catalog sync from provider APIs
- provider-specific auth wizard UX
- model fallback policies per runtime profile
