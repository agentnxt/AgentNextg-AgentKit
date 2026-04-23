# AgentNxt CodeReviewer

Run locally:

```bash
PYTHONPATH=apps/code-reviewer uvicorn code_reviewer.api:app --reload
```

Test:

```bash
PYTHONPATH=apps/code-reviewer pytest apps/code-reviewer/tests -q
```
