# AgentNxt Module Map

This file defines module meanings and lifecycle state across:

- **Implemented**: code or config present in this repo today.
- **Partial / integration pattern**: represented by SDK abstractions, adapters, service glue, or gateway calls, but not yet a formal standalone module.
- **Planned / next state**: architecture direction that still needs concrete schemas, interfaces, tests, or ownership workflows.
- **Future modular split**: possible repo/service split once boundaries are stable.

## Canonical module definitions

- **model-registry**: canonical models and metadata.
- **prompt-registry**: canonical prompts and prompt assets.
- **skill-registry**: canonical reusable skills.
- **agent-registry**: canonical agents and agent definitions.
- **mcp-registry**: canonical MCP servers and tool assets.
- **model-runner**: model execution runtime.
- **model-gateway**: model traffic routing and policy.
- **mcp-gateway**: MCP/tool traffic routing and policy.
- **agent-builder**: agent build/config/package workflows.
- **agent-runner**: agent runtime orchestration.
- **agentnxt platform layer**: cross-module platform composition, governance, and APIs.
- **eval**: evaluation of models/prompts/skills/agents.
- **ops**: tracing, telemetry, observability, and operational controls.
- **docs**: architecture, setup, roadmap, and platform-facing documentation.

## Verified implemented SDK surface

Current code verifies these implementation areas:

- `autonomyx-adk` Python package from `src/autonomyx`.
- Public exports: `Agent`, `Tool`, `Workflow`, `IdentityClient`.
- CLI entry point: `autonomyx`.
- CLI commands: `run`, `provision`, and `skills`.
- LangChain, CrewAI, and AutoGen adapter files.
- Environment-configured calls to identity, LLM gateway, registry, and MCP/tool gateway services.

## Mapping table

| Module | Current state in this repo | Recommended next state | Future modular split |
|---|---|---|---|
| model-registry | Planned; not a dedicated package | Define schema + storage conventions in-repo | Split if model governance scales independently |
| prompt-registry | Planned; prompt artifacts appear ad hoc | Establish canonical prompt paths/versioning | Split if prompt workflows require separate lifecycle |
| skill-registry | Partial; CLI lists registry skills and `Tool.mcp()` references MCP skills | Formalize reusable skill contracts and metadata | Split after stable skill API and governance |
| agent-registry | Planned; agent definitions are code-centric | Add explicit agent metadata/index | Split when agent catalog and publishing mature |
| mcp-registry | Partial; MCP integration exists through gateway/tool patterns | Inventory MCP assets and ownership metadata | Split if MCP ecosystem velocity requires isolation |
| model-runner | Partial; `Agent.run()` routes to Anthropic or configured LLM gateway | Define unified execution interfaces | Split when runtime requirements diverge |
| model-gateway | Partial; represented by environment-configured gateway calls | Define gateway contracts and policy hooks | Split if gateway becomes independent control plane |
| mcp-gateway | Partial; `Tool.mcp()` builds gateway-backed MCP calls | Centralize tool routing/policy layer | Split when traffic/security policy hardens |
| agent-builder | Partial; SDK and team workflows provide proto-builder behavior | Add packaging/config standards | Split when builder UX/workbench stabilizes |
| agent-runner | Implemented at SDK workflow level; broader runtime remains partial | Normalize orchestration/runtime contracts | Split when runtime scales independently |
| agentnxt platform layer | Emergent across repo | Define top-level platform interfaces and governance | Keep central unless hard platform boundary emerges |
| eval | Planned; minimal explicit structure today | Add evaluation harness and benchmark hooks | Split if eval workload/tooling becomes distinct platform |
| ops | Planned/partial; operational pieces are scattered | Define observability and policy baseline | Split if ops control-plane scope expands |
| docs | Implemented but still being aligned | Treat docs as first-class platform module | Could remain in foundation repo |

## Documentation rule

Do not describe a module as fully implemented unless it has concrete code, configuration, tests, or service contracts in this repository. Use planned or partial status for roadmap architecture until the implementation exists.
