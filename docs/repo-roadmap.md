# AgentKit Repo Roadmap

## Current state (now)

- AgentKit is the primary active AgentNxt codebase.
- Platform components exist, but narrative/module boundaries were previously under-specified.
- Registry/gateway/runtime concepts are partially implemented and partially documented.

## Recommended next state (next 1-3 phases)

1. **Foundation clarity (this change set)**
   - Align README and docs with AgentNxt platform scope and boundaries.
   - Define canonical module map and ownership language.

2. **Governance baseline**
   - Standardize prompt/model/skill/agent/MCP artifact structures.
   - Add minimal metadata/versioning conventions.

3. **Runtime and gateway contracts**
   - Normalize model-runner/agent-runner interfaces.
   - Define model-gateway and mcp-gateway policy surfaces.

4. **Eval and ops baseline**
   - Add initial evaluation harness patterns.
   - Standardize observability/tracing hooks.

## Future modular split (only when stable)

Potential split candidates when boundaries are proven:
- registries (model/prompt/skill/agent/mcp)
- runners/gateways (model-runner, model-gateway, mcp-gateway, agent-runner)
- platform control plane (`agentnxt`)
- eval and ops

Splits should be contract-driven and staged, not speculative.

## Decision rule

Prefer shipping coherent product slices in this foundation repo first. Split only when module interfaces, ownership, and release cadence are clear.
