# AgentBuilder Operations

## Runtime
- ASGI server: `uvicorn`
- Health endpoint: `/health`
- Default storage: repository `registry/agents/`

## Operational checks
- API health response
- write/read path permissions for registry folder
- lifecycle policy validation behavior via tests

## Deploy concerns
- mount persistent volume for registry path when running outside git working tree
- enforce branch protection and PR review for agent definition changes
- configure backup/archive for exported package artifacts
