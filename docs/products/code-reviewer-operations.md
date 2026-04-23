# AgentNxt CodeReviewer Operations

## Run
```bash
PYTHONPATH=apps/code-reviewer uvicorn code_reviewer.api:app --reload
```

## Key endpoints
- `GET /health`
- `POST /api/runtime-profiles`
- `GET /api/runtime-profiles`
- `POST /api/reviews`
- `GET /api/reviews`
- `GET /api/reviews/{job_id}`

## Runtime profiles
Supported providers: Anthropic, Amazon Bedrock, Google Vertex AI, Microsoft Foundry.
Model selection is independent and validated against provider catalogs.
