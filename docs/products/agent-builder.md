# AgentBuilder Product Documentation

## Current state
AgentBuilder is implemented in `apps/agent-builder` with:
- FastAPI backend endpoints for agent definition CRUD-like operations and lifecycle transitions.
- Production browser UI for editing, validating, and listing definitions.
- GitHub-backed file storage conventions under `registry/agents/`.

## Recommended next state
- Add authentication/authorization middleware.
- Add review/approval workflows integrated with PR checks.
- Add semantic version orchestration automation.

## Future state
- Integrate directly with dedicated `agent-registry` service when split boundaries stabilize.
