# Langflow Components for AgentKit

Three Langflow custom components wrapping the three teams:

| Component | Team | What it does |
|---|---|---|
| `CoderAgentComponent` | `teams/devteam` | Full engineering pipeline: HLD → architecture review → code → review → security → merge |
| `DocAgentComponent` | `teams/docteam` | GitHub repo → generated README / API reference / architecture docs |
| `ImageAgentComponent` | `teams/imageteam` | Image generate / edit / upscale / remove-bg / describe |

All three share the same `AgentState` TypedDict from `teams._shared.state`, so they compose cleanly with any other Langflow component that speaks `Data` / `Message`.

## How to load into Langflow

```bash
# Option 1: environment variable (recommended for dev)
export LANGFLOW_COMPONENTS_PATH=$HOME/agentkit/langflow_components
# (components live in the agentkit/ subdirectory — that becomes their category)
langflow run

# Option 2: mount into Langflow's container
docker run -p 7860:7860 \
  -v $HOME/agentkit:/app/agentkit \
  -e LANGFLOW_COMPONENTS_PATH=/app/agentkit/langflow_components \
  -e PYTHONPATH=/app/agentkit \
  langflowai/langflow:latest
```

After Langflow boots, the components appear under **"AgentKit"** in the component library sidebar.

## Requirements

The Langflow process needs these Python deps from `pyproject.toml`:

- `langgraph`, `langchain-core`, `langchain-anthropic` (already installed by Langflow)
- `anthropic` (for devteam)
- `httpx` (for docteam)

And these env vars depending on which team is being used:

- `ANTHROPIC_API_KEY` — devteam, imageteam
- `AGENTCODE_URL` — devteam (defaults to `https://code.agnxxt.com`)
- `OLLAMA_URL` or `LITELLM_URL` — docteam
- `GITHUB_TOKEN` — docteam
- Image backend URLs/keys — imageteam (see `teams/imageteam/tools.py`)

## Programmatic use (outside Langflow)

Every component wraps a LangGraph graph that's also importable directly:

```python
from teams.devteam.graph import graph

result = graph.invoke({
    "input": "Add rate limiting to the /api/v1/tenants endpoint",
    "params": {},
    "retries": 0,
})
print(result["output"])
```

Same pattern for `teams.docteam.graph` and `teams.imageteam.graph`.
