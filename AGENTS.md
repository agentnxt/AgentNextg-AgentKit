# AGENTS.md

## Repo Role

This repository is the main foundation repo for the **AgentNxt AI Platform**.

It is the main place for:
- AI platform foundation code
- model, prompt, skill, and agent platform components
- agent runtime and orchestration foundations
- MCP/tool integration
- AI platform architecture documentation
- module and roadmap definition

It is **not** the Data Platform.
It is **not** the Identity Platform.
It is **not** the Intelligence Platform.

---

## Source of Truth Rules

### 1. Prompt Registry first
Before doing any work:

1. Save the current task prompt to the appropriate Prompt Registry location in GitHub
2. Read the stored prompt back from GitHub
3. Use the GitHub-stored version as the canonical prompt for execution

### 2. PRD first
Before making recommendations or changes:

1. Read the org-wide PRD from the Prompt Registry
2. Treat it as the architectural source of truth
3. Do not contradict it silently
4. If repo reality differs from the PRD, identify the mismatch explicitly and propose a correction

### 3. GitHub is the system of record
GitHub is the system of record for:
- prompts
- PRDs
- docs
- code
- outputs
- reviews
- approvals
- final published versions

Chat is for drafting.  
GitHub is for record, review, revision, approval, and publishing.

---

## Operating Rule

Build the product first.

If the repo structure, templates, docs, prompts, or this `AGENTS.md` file need improvement to support the product cleanly, update them in the same change set.

Do **not** redesign the whole platform before shipping the next usable product.

Make only the minimum structural changes needed for the current product, but leave the repo cleaner than you found it.

---

## Platform Context

- **OpenDataWorld** = Data Platform
- **AgentNxt** = AI Platform
- Data Platform is the current company execution priority
- AI Platform should continue in parallel at the foundation level
- AgentNxt consumes governed data assets from OpenDataWorld
- GitHub is the storage, versioning, review, approval, and publishing layer

### Long-term AI Platform direction
The AI Platform will support canonical records across domain registries such as:
- model registry
- prompt registry
- skill registry
- agent registry
- MCP registry

Canonicality is platform-wide.  
Each registry is the canonical system of record for its domain.

Do not force all future modules into separate repos immediately.
Document the future structure first. Split only when boundaries are stable.

---

## AI Platform Direction

The AgentNxt AI Platform is for:
- registering and governing models
- storing and governing prompts
- storing and governing skills
- building and packaging agents
- running agents
- routing model and MCP/tool traffic
- evaluating agents, prompts, skills, and models
- providing runtime and orchestration infrastructure

Key product directions include:
- AgentBuilder
- AgentRunner
- AgentNxt platform layer
- ModelRunner
- ModelGateway
- MCPGateway
- registries for models, prompts, skills, agents, and MCP assets

---

## OSS Strategy

Prefer:
1. integrate
2. compose
3. clone if helpful
4. fork only when durable product-specific customization is truly necessary

Do not rewrite mature OSS infrastructure unnecessarily.

Important ecosystem foundations may include:
- LangGraph
- Langflow
- LangChain
- CrewAI
- AutoGen
- Ollama
- MCP-compatible tools and servers
- model-serving OSS where relevant

---

## Current Module Meanings

- **model-registry** = canonical models and metadata
- **prompt-registry** = canonical prompts and prompt assets
- **skill-registry** = canonical reusable skills
- **agent-registry** = canonical agents and agent definitions
- **mcp-registry** = canonical MCP servers and tool assets
- **model-runner** = runs models
- **model-gateway** = routes model traffic
- **mcp-gateway** = routes MCP/tool traffic
- **agent-builder** = builds and configures agents
- **agent-runner** = LangGraph or equivalent runtime
- **agentnxt** = broader AI platform layer
- **eval** = model/prompt/skill/agent evaluation
- **ops** = tracing, telemetry, observability
- **docs** = architecture, setup, roadmap, and platform-facing documentation

---

## What to Optimize For

Optimize for:
- practical progress
- clean architecture
- clear docs
- reviewable changes
- repo consistency
- explicit current vs next vs future state
- GitHub-backed prompt and output governance

Do not optimize for:
- abstract perfection
- premature repo splitting
- unnecessary rewrites
- undocumented architectural drift

---

## Required Execution Pattern

For each task:

1. Save prompt to Prompt Registry
2. Read prompt back from Prompt Registry
3. Read org PRD
4. Inspect current repo state
5. Build the requested product or capability slice
6. Update docs/structure only as needed
7. Save outputs in GitHub
8. Save review notes in GitHub
9. Keep final approved state in GitHub only

---

## Output Expectations

Every substantial task should clearly distinguish:
- **current state**
- **recommended next state**
- **future state**

Every substantial task should leave behind:
- updated files
- updated docs if needed
- clear review notes
- explicit follow-ups if unfinished

---

## Relationship to OpenDataWorld

Do not re-own Data Platform responsibilities here.

OpenDataWorld owns:
- datasets
- schemas
- taxonomies
- vocabularies
- canonical entities
- things
- publication
- licensing
- evaluation datasets

AgentNxt should consume governed outputs from OpenDataWorld where relevant.

Examples:
- agents may use taxonomies or canonical entities
- models may reference dataset or feature assets
- evaluation may use benchmark datasets curated by the Data Platform

---

## If There Is a Conflict

If any of the following conflict:
- repo reality
- task prompt
- PRD
- existing docs

Then:
1. do not guess silently
2. state the conflict clearly
3. propose the smallest correction that moves the repo toward the PRD

---

## Default Priority

When in doubt, prioritize:
1. shipping a usable product slice
2. clarifying repo structure
3. improving docs and prompts
4. preparing future modularization
