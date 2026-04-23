# AgentNxt Org High-Level PRD

## Product scope
AgentNxt is the AI platform for model, prompt, skill, agent, and MCP asset governance and execution.

## Platform products
- AgentBuilder: create, validate, version, and package agent definitions.
- AgentRunner: run registered agents with runtime policy controls.
- ModelRunner/ModelGateway: model execution and routing.
- MCPGateway: tool and MCP traffic routing.

## Architectural principles
1. GitHub-backed canonical storage for prompts, docs, and governed definitions.
2. Registry-first architecture (model/prompt/skill/agent/mcp).
3. Production quality over prototypes.
4. Incremental modularization; do not split repos before boundaries stabilize.
5. Clear separation from OpenDataWorld Data Platform ownership.

## Non-goals
- Re-owning Data Platform datasets, schemas, taxonomies, vocabularies, licensing.
- Premature rewrite of mature OSS components.

## Delivery expectations
Each product slice must include API, UI where needed, validation, versioning/storage semantics, tests, operations docs, deploy scaffolding, and explicit deferred hardening notes.
