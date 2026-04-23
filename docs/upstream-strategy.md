# Upstream Strategy

## Principle

AgentNxt follows: **integrate → compose → clone (if useful) → fork (only when necessary)**.

This minimizes maintenance burden and avoids unnecessary rewrites of mature OSS.

## OSS foundations in scope

Current and near-term ecosystem anchors:
- LangGraph
- Langflow
- LangChain
- CrewAI
- AutoGen
- Ollama
- MCP-compatible tools/servers
- model-serving OSS where appropriate

## How strategy is applied in AgentKit

### Current state
- Existing code already composes multiple frameworks (adapters, team graphs, Langflow components).
- Some service implementations are product-specific but still rely on external ecosystem primitives.

### Recommended next state
- Keep framework adapters thin and explicit.
- Avoid replacing mature runtime/gateway/tooling internals unless a hard product requirement appears.
- Isolate platform-specific policies, governance, and integration glue in AgentNxt-owned layers.

### Future state
- Fork or deep-customize only modules with sustained, durable differentiation.
- Document any fork decision with cost/benefit and ongoing maintenance owner.

## Non-goals

- Rewriting major orchestration frameworks from scratch.
- Pretending isolated products exist before interfaces and ownership are stable.
