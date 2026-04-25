# Codebase Alignment Notes

This document records the current documentation-to-code alignment for `agentnxt/agentkit`.

## Source-of-truth status

The requested instruction source `openatuonomyx/common-instrctions` could not be found from accessible GitHub search. I also checked likely corrected spellings such as `openautonomyx/common-instructions` and did not find an accessible matching repository.

Until that repo is available, this audit uses the live `agentnxt/agentkit` codebase as the source of truth.

## Verified current implementation

The currently verified package is `autonomyx-adk` version `0.1.0`, built from `src/autonomyx` and exposed through the `autonomyx` console script.

Implemented public SDK exports:

- `Agent`
- `Tool`
- `Workflow`
- `IdentityClient`

Implemented CLI commands:

- `autonomyx run <prompt>`: runs a single agent prompt.
- `autonomyx provision <name>`: provisions an agent identity.
- `autonomyx skills`: lists available registry skills.

Implemented runtime behavior:

- `Agent` auto-provisions identity when enabled.
- `Agent.run()` uses Anthropic directly when `ANTHROPIC_API_KEY` is available.
- Without an Anthropic key, `Agent.run()` falls back to the configured Autonomyx LLM gateway.
- `Tool.mcp()` builds MCP skill calls through the configured gateway URL.
- `Tool.function()` wraps local Python callables.
- `Workflow` runs dependency-ordered multi-agent steps.

Implemented adapters:

- LangChain adapter via `to_langchain()`.
- CrewAI adapter via `to_crewai()`.
- AutoGen adapter via `to_autogen_agent()`.

## Documentation alignment findings

The existing docs are broadly directionally correct, but some language can read as if platform-level registries, gateways, eval, and ops modules are already fully implemented. Current code shows these should be documented as roadmap or partially implemented areas unless concrete packages, schemas, or service contracts are present.

Recommended documentation convention:

- Use **Implemented** for code present in `src/autonomyx`, `teams`, `langflow_components`, or `services`.
- Use **Partial / integration pattern** for behavior represented by adapters, service glue, or environment-configured gateway calls.
- Use **Planned / next state** for canonical registries, formal governance workflows, eval harnesses, ops baselines, and future repo splits.

## Gaps to resolve next

1. Publish or connect the intended `openautonomyx/common-instructions` source so repo docs can cite and follow it directly.
2. Add setup documentation for required environment variables, including:
   - `ANTHROPIC_API_KEY`
   - `AUTONOMYX_LLM_URL`
   - `AUTONOMYX_API_URL`
   - `AUTONOMYX_MASTER_KEY`
   - `AUTONOMYX_TENANT_ID`
   - `AUTONOMYX_SPONSOR_ID`
   - `AUTONOMYX_REGISTRY_URL`
   - `AUTONOMYX_GATEWAY_URL`
3. Move any credential-like values out of source code and into environment configuration or repository secrets.
4. Add quickstart examples for `Agent`, `Tool`, `Workflow`, and the CLI.
5. Add a module status table that separates implemented code from roadmap architecture.
