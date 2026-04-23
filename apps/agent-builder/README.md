# AgentBuilder

Production-ready AgentNxt application for authoring, validating, versioning, and packaging agent definitions.

## Run

```bash
PYTHONPATH=apps/agent-builder uvicorn main:app --reload
```

## API
- `GET /api/agents`
- `POST /api/agents`
- `POST /api/agents/validate`
- `POST /api/agents/{agent_id}/transition`
- `GET /api/agents/{agent_id}/export`

## Storage
Definitions are stored in `registry/agents/<agent_id>/<version>.json` with `latest.json` pointers for the most recent definition.
