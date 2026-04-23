# AgentBuilder Architecture

## Domain model
Agent definition fields:
- agent_id
- name
- version
- status
- model_refs
- prompt_refs
- skill_refs
- tool_refs
- runtime_config
- policy_metadata

Lifecycle states: `draft -> validated -> released -> archived`.

## Layers
- `models.py`: Pydantic domain entities and lifecycle contracts.
- `validation.py`: state-aware policy validation.
- `storage.py`: GitHub-backed filesystem persistence convention.
- `service.py`: business rules and lifecycle enforcement.
- `api.py`: REST API and export endpoint.
- `web/index.html`: production operator UI.
