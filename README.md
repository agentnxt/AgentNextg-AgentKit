# AgentNxt AgentKit

AgentKit is the current foundation repository for the AgentNxt AI Platform and the home of the `autonomyx-adk` Python SDK.

The implemented SDK lives in `src/autonomyx` and exposes a compact agent development surface:

- `Agent` for single-agent execution.
- `Tool` for local Python functions and MCP-backed tools.
- `Workflow` for dependency-ordered multi-agent steps.
- `IdentityClient` for Autonomyx agent identity provisioning.

The broader platform architecture is documented here as current implementation plus next-state direction. Registry, gateway, eval, ops, and future module-split language should be read as roadmap unless a concrete implementation exists in this repo.

> Scope boundary: this repository is for the AgentNxt AI Platform foundation. It is not the Data Platform, Identity Platform, or Intelligence Platform, though it integrates with identity and gateway services.

## Current implementation

Current, verified assets in this repo include:

- `src/autonomyx/` — Python SDK package for agents, tools, workflows, identity, and framework adapters.
- `pyproject.toml` — Python package metadata for `autonomyx-adk` and the `autonomyx` CLI entry point.
- `src/autonomyx/cli.py` — CLI commands for `run`, `provision`, and `skills`.
- `src/autonomyx/adapters/` — adapters for LangChain, CrewAI, and AutoGen.
- `teams/` — multi-team workflow and shared-state patterns.
- `langflow_components/` — custom Langflow components wrapping team workflows.
- `services/autonomyx-developer-agent/` — service implementation for review/delegation flows.
- Baseline infra/config files such as `Dockerfile`, `docker-compose.yml`, and project metadata.

These are implementation slices in a foundation repo, not yet fully separated products.

## Quickstart

Install the package from a local checkout:

```bash
pip install -e .
```

Run a single prompt:

```bash
autonomyx run "Summarize the AgentKit repo"
```

Provision an agent identity:

```bash
autonomyx provision my-agent --tenant default
```

Use the SDK:

```python
from autonomyx import Agent, Tool, Workflow

agent = Agent(
    name="research-agent",
    model="claude-sonnet-4-20250514",
    tools=[Tool.mcp("skill-searxng")],
)

result = await agent.run("Research this topic")
```

## Configuration

The SDK uses environment variables for service integration:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables direct Anthropic execution in `Agent.run()` |
| `AUTONOMYX_LLM_URL` | LLM gateway base URL |
| `AUTONOMYX_API_URL` | Identity API base URL |
| `AUTONOMYX_MASTER_KEY` | Master/service key for identity and gateway calls |
| `AUTONOMYX_TENANT_ID` | Default tenant used during provisioning |
| `AUTONOMYX_SPONSOR_ID` | Default sponsor used during provisioning |
| `AUTONOMYX_REGISTRY_URL` | Registry base URL |
| `AUTONOMYX_GATEWAY_URL` | MCP/tool gateway base URL |

Do not hard-code production credentials in source files. Use environment variables or repository/runtime secrets.

## AgentNxt vs OpenDataWorld

**OpenDataWorld (Data Platform) owns governed data assets**, including:

- datasets
- schemas
- taxonomies and vocabularies
- canonical entities/things
- publications and licensing
- evaluation datasets

**AgentNxt (AI Platform) owns AI execution assets**, including:

- model, prompt, skill, agent, and MCP registry direction
- model and tool gateway integration patterns
- model and agent runtime layers
- agent packaging and orchestration
- evaluation and operational observability for AI workloads

AgentNxt may consume governed outputs from OpenDataWorld, but does not re-own Data Platform responsibilities.

## Architecture direction: canonical registries

AgentNxt direction is platform-level canonicality via domain registries:

- **model-registry**: canonical models and metadata
- **prompt-registry**: canonical prompts and prompt assets
- **skill-registry**: canonical reusable skills
- **agent-registry**: canonical agents and agent definitions
- **mcp-registry**: canonical MCP server/tool assets

At this stage, these are primarily documented architecture directions and should be implemented incrementally in this foundation repo before any stable repo split.

## OSS integration strategy

AgentNxt follows an upstream-first strategy:

1. **Integrate** mature OSS.
2. **Compose** OSS into platform workflows.
3. **Clone** only when helpful for fast iteration.
4. **Fork** only when durable, product-specific customization is necessary.

Relevant ecosystem foundations include LangGraph, Langflow, LangChain, CrewAI, AutoGen, Ollama, and MCP-compatible tools/servers.

## Platform documentation map

- [Platform overview](docs/platform-overview.md)
- [Module map](docs/module-map.md)
- [Upstream strategy](docs/upstream-strategy.md)
- [Repo roadmap](docs/repo-roadmap.md)
- [Codebase alignment notes](docs/codebase-alignment.md)
- [Bootstrap review notes](reviews/agentkit/bootstrap-review.md)

## Delivery posture

- Build usable slices first.
- Keep changes reviewable.
- Make minimum structural changes needed now.
- Separate **implemented state**, **partial/integration state**, **next state**, and **future split** explicitly.
