# AgentNxt CodeReviewer Roadmap

## Near-term
1. Replace heuristic reviewer adapter with full Claude Agent SDK session orchestration.
2. Add background queue worker and async status transitions.
3. Add authz, tenant partitioning, and audit logs.

## Mid-term
1. Postgres persistence and object storage for large patch payloads.
2. GitHub app ingestion with PR webhook triggers.
3. Slack and VS Code adapters with shared findings rendering.

## Long-term
1. Unified policy packs and org-level quality gates.
2. Model/provider routing policy layer shared with future platform services.
