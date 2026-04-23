# AgentNxt Module Map

This file defines module meanings and lifecycle state across:
- **Current state**: what exists now in `agentkit`
- **Recommended next state**: what should be consolidated next
- **Future modular split**: what may later split when stable

## Canonical module definitions

- **model-registry**: canonical models and metadata
- **prompt-registry**: canonical prompts and prompt assets
- **skill-registry**: canonical reusable skills
- **agent-registry**: canonical agents and agent definitions
- **mcp-registry**: canonical MCP servers and tool assets
- **model-runner**: model execution runtime
- **model-gateway**: model traffic routing and policy
- **mcp-gateway**: MCP/tool traffic routing and policy
- **agent-builder**: agent build/config/package workflows
- **agent-runner**: agent runtime orchestration (LangGraph/equivalent)
- **agentnxt platform layer**: cross-module platform composition, governance, and APIs
- **eval**: evaluation of models/prompts/skills/agents
- **ops**: tracing, telemetry, observability, and operational controls
- **docs**: architecture, setup, roadmap, and platform-facing documentation

## Mapping table

| Module | Current state in this repo | Recommended next state | Future modular split |
|---|---|---|---|
| model-registry | Not yet a dedicated package | Define schema + storage conventions in-repo | Split if model governance scales independently |
| prompt-registry | Prompt artifacts exist ad hoc | Establish canonical prompt paths/versioning | Split if prompt workflows require separate lifecycle |
| skill-registry | Skills are implicit in teams/tools | Formalize reusable skill contracts | Split after stable skill API and governance |
| agent-registry | Agent definitions are code-centric | Add explicit agent metadata/index | Split when agent catalog and publishing mature |
| mcp-registry | MCP integration exists in service/team code | Inventory MCP assets and ownership metadata | Split if MCP ecosystem velocity requires isolation |
| model-runner | Partial via adapters and service patterns | Define unified execution interfaces | Split when runtime requirements diverge |
| model-gateway | Referenced operationally, limited platform abstraction | Define gateway contracts and policy hooks | Split if gateway becomes independent control plane |
| mcp-gateway | MCP routes implemented piecemeal | Centralize tool routing/policy layer | Split when traffic/security policy hardens |
| agent-builder | Team workflows provide proto-builder behavior | Add packaging/config standards | Split when builder UX/workbench stabilizes |
| agent-runner | Present via teams + LangGraph patterns | Normalize orchestration/runtime contracts | Split when runtime scales independently |
| agentnxt platform layer | Emergent across repo | Define top-level platform interfaces and governance | Keep central unless hard platform boundary emerges |
| eval | Minimal explicit structure today | Add evaluation harness and benchmark hooks | Split if eval workload/tooling becomes distinct platform |
| ops | Scattered operational pieces | Define observability and policy baseline | Split if ops control-plane scope expands |
| docs | Sparse/fragmented | Treat docs as first-class platform module | Could remain in foundation repo |
