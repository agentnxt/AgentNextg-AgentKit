# AgentNxt AgentKit

AgentKit is the **main foundation repository for the AgentNxt AI Platform**.

This repo is where AgentNxt currently concentrates practical platform work across:
- AI platform foundations and shared runtime building blocks
- agent team orchestration and workflow experiments (including LangGraph patterns)
- framework adapters/SDK surface (`autonomyx` package)
- MCP/tool integration patterns
- architecture and module-definition documentation for the next platform phase

> Scope boundary: this repository is for the **AI Platform**. It is not the Data Platform, Identity Platform, or Intelligence Platform.

## Why this repo exists now

AgentKit is the most substantive active codebase in AgentNxt today. Instead of prematurely splitting many repos, we use this repo as the foundation while clarifying module boundaries and roadmap.

This supports near-term delivery while reducing architectural drift.

## Current scope (what exists today)

Current, concrete assets in this repo include:
- `src/autonomyx/` SDK and adapters (LangChain, CrewAI, AutoGen integration points)
- `teams/` multi-team agent workflows and shared state patterns
- `langflow_components/` custom Langflow components wrapping team workflows
- `services/autonomyx-developer-agent/` service implementation for review/delegation flows
- baseline infra/config files (`Dockerfile`, `docker-compose.yml`, `pyproject.toml`)

These are real implementation slices, not placeholders for separated products.

## AgentNxt vs OpenDataWorld

**OpenDataWorld (Data Platform) owns governed data assets**, including:
- datasets
- schemas
- taxonomies and vocabularies
- canonical entities/things
- publications and licensing
- evaluation datasets

**AgentNxt (AI Platform) owns AI execution assets**, including:
- model, prompt, skill, agent, and MCP registries
- model and tool gateways
- model and agent runtime layers
- agent packaging and orchestration
- evaluation and operational observability for AI workloads

AgentNxt may consume governed outputs from OpenDataWorld, but does not re-own Data Platform responsibilities.

## Long-term architecture direction: canonical registries

AgentNxt direction is platform-level canonicality via domain registries:
- **model-registry**: canonical models + metadata
- **prompt-registry**: canonical prompts + prompt assets
- **skill-registry**: canonical reusable skills
- **agent-registry**: canonical agents + agent definitions
- **mcp-registry**: canonical MCP server/tool assets

In this phase, module definitions are documented first and implemented incrementally in this foundation repo.

## OSS integration strategy (default)

AgentNxt follows an upstream-first strategy:
1. **Integrate** mature OSS
2. **Compose** OSS into platform workflows
3. **Clone** only when helpful for fast iteration
4. **Fork** only when durable, product-specific customization is necessary

Relevant ecosystem foundations include LangGraph, Langflow, LangChain, CrewAI, AutoGen, Ollama, and MCP-compatible tools/servers.

## Platform documentation map

- [Platform overview](docs/platform-overview.md)
- [Module map](docs/module-map.md)
- [Upstream strategy](docs/upstream-strategy.md)
- [Repo roadmap](docs/repo-roadmap.md)
- [Bootstrap review notes](reviews/agentkit/bootstrap-review.md)

## Delivery posture

- Build usable slices first
- Keep changes reviewable
- Make minimum structural changes needed now
- Separate **current state**, **next state**, and **future split** explicitly
