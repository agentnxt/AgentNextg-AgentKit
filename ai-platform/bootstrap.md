Prompt Registry Rule:
Before execution, first save this prompt to the appropriate Prompt Registry location in GitHub and then read it back. Treat the GitHub-stored version as the canonical prompt. All outputs, revisions, reviews, and approved final versions must be logged and managed through GitHub only.

PRD Rule:
Before doing any work, read the org-wide PRD from the Prompt Registry and use it as the architectural source of truth. Do not contradict the PRD. If current repo reality differs from the PRD, identify the mismatch explicitly and propose a correction.

Repo:
agentnxt/agentkit

Prompt Registry Path:
ai-platform/bootstrap.md

Related PRD:
org/high-level-prd.md

Output Paths:
- README.md
- docs/platform-overview.md
- docs/module-map.md
- docs/upstream-strategy.md
- docs/repo-roadmap.md
- reviews/agentkit/bootstrap-review.md

Objective:
Reposition `agentnxt/agentkit` as the main foundation repo for the AgentNxt AI Platform and make the repo structure, documentation, and platform narrative consistent with the PRD.

Current State:
- `agentkit` is the main substantive repo in AgentNxt.
- The repo already contains meaningful AI platform work such as SDK/adapters, agent teams, LangGraph/Langflow-related work, and identity-aware agent concepts.
- The README/docs/repo narrative may not yet cleanly reflect the clarified AI Platform structure.

Target State:
- The repo clearly presents AgentNxt as the AI Platform foundation repo.
- The README explains current scope, planned modules, and relation to OpenDataWorld.
- The docs define the module map and future repo structure without prematurely splitting everything.
- The OSS strategy is explicit: integrate/compose first, fork only when necessary.
- The repo is cleaner and more understandable after the change.

Required Work:
1. Audit the existing README, docs, and current repo structure.
2. Rewrite README.md to:
   - position this repo as the AgentNxt AI Platform foundation repo
   - explain current purpose and scope
   - explain relation to OpenDataWorld
   - explain canonical registries as the long-term architecture
   - explain current OSS foundations and integration direction
3. Create:
   - docs/platform-overview.md
   - docs/module-map.md
   - docs/upstream-strategy.md
   - docs/repo-roadmap.md
4. In the docs, define these module meanings clearly:
   - model-registry
   - prompt-registry
   - skill-registry
   - agent-registry
   - mcp-registry
   - model-runner
   - model-gateway
   - mcp-gateway
   - agent-builder
   - agent-runner
   - agentnxt platform layer
   - eval
   - ops
   - docs
5. Distinguish clearly between:
   - current state
   - recommended next state
   - future modular split
6. Do not aggressively create fake product claims or pretend separate repos already exist.
7. Leave review notes in:
   - reviews/agentkit/bootstrap-review.md

Rules:
- Build the product/repo clarity first
- Make only the minimum structural changes needed
- Prefer practical documentation and organization over abstract redesign
- Keep AgentNxt and OpenDataWorld clearly separate
- Do not rewrite OSS systems unnecessarily
- Keep changes reviewable

Important boundary:
- OpenDataWorld owns governed data assets such as datasets, schemas, taxonomies, vocabularies, canonical entities, things, publications, and evaluation datasets
- AgentNxt owns models, prompts, skills, agents, runtimes, gateways, and AI execution infrastructure
- AgentNxt may consume governed assets from OpenDataWorld but should not re-own Data Platform responsibilities

Deliverables:
1. Updated README.md
2. New docs files
3. Review note documenting:
   - what changed
   - what remains future work
   - any mismatches found between repo reality and PRD

Final Output Format:
1. Summary
2. Files created/updated
3. Key architecture decisions reflected
4. Remaining follow-ups
