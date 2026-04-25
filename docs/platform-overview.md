# AgentNxt Platform Overview

## Purpose

`agentnxt/agentkit` is the current foundation repository for the AgentNxt AI Platform and the home of the `autonomyx-adk` Python SDK.

The repo centralizes practical platform development while module boundaries are hardened. Documentation should distinguish what is implemented today from next-state architecture and future repo/service splits.

## Implemented state

Today, this repo contains verified implementation in these areas:

- SDK and adapter surface in `src/autonomyx`.
- Core SDK exports: `Agent`, `Tool`, `Workflow`, and `IdentityClient`.
- CLI entry point `autonomyx` with `run`, `provision`, and `skills` commands.
- Framework adapters for LangChain, CrewAI, and AutoGen.
- Environment-configured identity, LLM gateway, registry, and MCP gateway integrations.
- Team-based orchestration patterns in `teams`.
- Langflow integration components in `langflow_components`.
- Service-level review/delegation implementation in `services/autonomyx-developer-agent`.
- Foundational infra/project configuration.

## Partial or integration-pattern state

These areas are represented by SDK abstractions, adapters, gateway calls, service glue, or docs, but should not be described as fully mature standalone platform modules yet:

- model gateway
- MCP gateway
- skill registry
- agent runner
- agent builder
- observability and operational controls
- evaluation hooks

## Recommended next state

Over the next implementation slices:

1. Keep this repo as the canonical foundation integration point.
2. Document and enforce module ownership boundaries in code and docs.
3. Add setup and operations docs for required environment variables and service dependencies.
4. Convert roadmap-level registry/gateway concepts into concrete schemas, interfaces, and tests.
5. Add governance workflows around prompt/model/skill/agent/MCP registries.
6. Strengthen runtime/gateway/eval/ops interfaces as platform contracts.

## Future state: modular split only when stable

When boundaries and ownership are stable, split selected modules into dedicated repos or services with explicit contracts. Until then, avoid premature fragmentation.

## Boundary with OpenDataWorld

OpenDataWorld remains system-of-record for governed data assets, including datasets, schemas, taxonomies, vocabularies, canonical entities, publications, licensing, and evaluation datasets.

AgentNxt consumes those governed assets and owns AI execution infrastructure, including registries, runners, gateways, orchestration, evaluation, and ops.

## Source-of-truth note

The requested `openatuonomyx/common-instrctions` source could not be found from accessible GitHub search. Until that source is available, documentation in this repo should be aligned to the implemented codebase first and to platform architecture second.
