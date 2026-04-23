# AgentBuilder Production Prompt

Prompt Registry Rule:
Before execution, first save this prompt to the appropriate Prompt Registry location in GitHub and then read it back. Treat the GitHub-stored version as the canonical prompt. All outputs, revisions, reviews, and approved final versions must be logged and managed through GitHub only.

PRD Rule:
Before doing any work, read the org-wide PRD from the Prompt Registry and use it as the architectural source of truth. Do not contradict the PRD. If current repo reality differs from the PRD, identify the mismatch explicitly and propose a correction.

Production App Rule:
Build this as a production application. Do not build an MVP, prototype, demo, mockup, or thin slice unless explicitly asked. The output must be structured, maintainable, testable, documented, deployable, and suitable for real use.

Common Layer Improvement Rule:
After completing product work, review the shared/common layers used by the product. If the product reveals weaknesses, duplication, missing utilities, unclear contracts, or documentation gaps in shared SDKs, templates, docs patterns, storage conventions, lifecycle conventions, or prompt patterns:
- identify them explicitly
- make the smallest useful improvement if it is low-risk and directly beneficial
- otherwise document the improvement as follow-up work

Do not redesign common layers abstractly.
Only improve them when real product execution exposes a real need.

Repo: agentnxt/agentkit
Prompt Registry Path: ai-platform/products/agent-builder-production.md
Related PRD: org/high-level-prd.md
Related Prompt Assets:
- ai-platform/bootstrap.md
- ai-platform/overview.md
- shared/review-prompt.md
- agents/repo-builder-agent.md

Output Paths:
- apps/agent-builder/
- docs/products/agent-builder.md
- docs/products/agent-builder-architecture.md
- docs/products/agent-builder-operations.md
- docs/products/agent-builder-roadmap.md
- deploy/agent-builder/
- reviews/products/agent-builder-production-review.md

Objective:
Build AgentBuilder as a production-ready application inside AgentNxt.
