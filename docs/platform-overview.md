# AgentNxt Platform Overview

## Purpose

`agentnxt/agentkit` is the current foundation repository for the AgentNxt AI Platform. It centralizes practical platform development while module boundaries are hardened.

## Current state

Today, this repo contains:
- SDK and adapter surface (`src/autonomyx`)
- Team-based orchestration implementations (`teams`)
- Langflow integration components (`langflow_components`)
- Service-level review/delegation implementation (`services/autonomyx-developer-agent`)
- Foundational infra/project configuration

This represents meaningful AI platform groundwork, but not yet a fully separated module-per-repo topology.

## Recommended next state

Over the next implementation slices:
1. Keep this repo as the canonical foundation integration point
2. Document and enforce module ownership boundaries in-code and in docs
3. Incrementally align naming/structure with the module map
4. Add governance workflows around prompt/model/skill/agent/MCP registries
5. Strengthen runtime/gateway/eval/ops interfaces as platform contracts

## Future state (modular split only when stable)

When boundaries and ownership are stable, split selected modules into dedicated repos or services with explicit contracts. Until then, avoid premature fragmentation.

## Boundary with OpenDataWorld

OpenDataWorld remains system-of-record for governed data assets (datasets, schemas, taxonomies, vocabularies, canonical entities, publications, licensing, evaluation datasets).

AgentNxt consumes those governed assets and owns AI execution infrastructure (registries, runners, gateways, orchestration, evaluation, and ops).
