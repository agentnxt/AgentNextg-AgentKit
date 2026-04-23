# AgentNxt CodeReviewer

## Current state
- Production Web/Cloud surface implemented at `apps/code-reviewer/` with FastAPI backend and integrated UI.
- Shared core domain includes review job modeling, findings, severity/recommendation taxonomy, and runtime profiles.

## Recommended next state
- Integrate live Claude Agent SDK client calls per provider auth mode.
- Back runtime/job persistence with Postgres in addition to file storage.

## Future state
- Surface adapters for Desktop, Mobile, VS Code, Slack, GitHub, and Chrome consume the same shared review contracts.
