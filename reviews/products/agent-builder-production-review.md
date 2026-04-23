# AgentBuilder Production Review Notes

## What changed
- Added production AgentBuilder app under `apps/agent-builder` with API, service, domain model, validation, storage, and UI.
- Added docs for product, architecture, operations, and roadmap.
- Added deploy scaffolding and tests.

## PRD alignment
- Matches PRD principles: registry-first, GitHub-backed, production-capable slice.

## Mismatches found
- `org/high-level-prd.md` did not exist in repo, so it was added.
- Related prompt assets (`ai-platform/overview.md`, `shared/review-prompt.md`, `agents/repo-builder-agent.md`) were missing and should be maintained consistently.

## Common-layer improvement suggested
- Introduce a shared registry storage SDK in `src/autonomyx` to avoid per-product custom persistence adapters.
