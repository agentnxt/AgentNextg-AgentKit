# AgentNxt CodeReviewer Architecture

## Core
- `code_reviewer.models`: canonical domain models.
- `code_reviewer.service`: orchestration for profile management and review lifecycle.
- `code_reviewer.claude_sdk`: Claude Agent SDK execution adapter boundary.
- `code_reviewer.storage`: filesystem persistence under `registry/code-reviewer`.

## Web/Cloud surface
- FastAPI endpoints provide profile CRUD-lite and review execution/history.
- Static UI in `apps/code-reviewer/web/index.html` exposes provider/model profile configuration and review submission.

## Other surfaces
- Starter adapters under `apps/code-reviewer/surfaces/*` reuse shared API and core domain contracts.
