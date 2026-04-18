"""FastAPI server: HTTP entrypoint for Slack, GitHub, VSCode, and direct callers.

Design notes:
- Reviews are serialized by a single asyncio.Lock because the Worker
  REGISTRY is a process-global and multiple concurrent Claude reviews in
  one process would interleave their worker pools. For higher throughput,
  run multiple replicas of this service behind a load balancer.
- Cost/spend data is NOT stored here — it lives in the LiteLLM gateway.
  /usage proxies the gateway's /spend/logs endpoint.
- SSE streams replay events from the DB so a late subscriber gets history
  plus live updates.
"""

from __future__ import annotations

import asyncio
import json
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

import db
from main import run_review_stream

load_dotenv()


REVIEW_LOCK = asyncio.Lock()
# Per-session event pubsub for SSE subscribers to receive live events.
_session_queues: dict[str, list[asyncio.Queue]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init_db()
    yield


app = FastAPI(title="autonomyx-developer-agent", lifespan=lifespan)


class ReviewRequest(BaseModel):
    task: str
    source: str = "api"
    source_meta: dict | None = None


class ReviewResponse(BaseModel):
    session_id: str
    status: str


def _publish(session_id: str, event: dict) -> None:
    for q in _session_queues.get(session_id, []):
        try:
            q.put_nowait(event)
        except asyncio.QueueFull:
            pass


async def _run_review_job(session_id: str, task: str) -> None:
    """Background task: run the review and persist every event."""
    async with REVIEW_LOCK:
        await db.set_status(session_id, "running")
        _publish(session_id, {"type": "status", "status": "running"})
        final_cost = None
        final_result = None
        try:
            async for ev in run_review_stream(task, session_id=session_id):
                await db.append_event(session_id, ev)
                _publish(session_id, ev)
                if ev["type"] == "result":
                    final_cost = ev.get("cost_usd")
                    final_result = ev.get("result")
            await db.finalize_session(session_id, final_result, final_cost)
            _publish(session_id, {"type": "status", "status": "completed"})
        except Exception as e:
            await db.set_status(session_id, "failed", error=str(e))
            _publish(session_id, {"type": "status", "status": "failed", "error": str(e)})
        finally:
            _publish(session_id, {"type": "__done__"})


@app.post("/review", response_model=ReviewResponse)
async def start_review(body: ReviewRequest, bg: BackgroundTasks) -> ReviewResponse:
    session_id = await db.create_session(body.task, body.source, body.source_meta)
    bg.add_task(_run_review_job, session_id, body.task)
    return ReviewResponse(session_id=session_id, status="pending")


@app.get("/review/{session_id}")
async def get_review(session_id: str):
    session = await db.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return session


@app.get("/review/{session_id}/events")
async def stream_events(session_id: str, request: Request):
    session = await db.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    async def gen() -> AsyncIterator[dict]:
        for ev in session["events"]:
            yield {"data": json.dumps(ev)}
        if session["status"] in ("completed", "failed"):
            yield {"event": "done", "data": "{}"}
            return
        q: asyncio.Queue = asyncio.Queue(maxsize=1024)
        _session_queues.setdefault(session_id, []).append(q)
        try:
            while True:
                if await request.is_disconnected():
                    break
                ev = await q.get()
                if ev.get("type") == "__done__":
                    yield {"event": "done", "data": "{}"}
                    break
                yield {"data": json.dumps(ev)}
        finally:
            _session_queues.get(session_id, []).remove(q)

    return EventSourceResponse(gen())


@app.get("/sessions")
async def list_sessions(limit: int = 100):
    return await db.list_sessions(limit=limit)


@app.get("/usage")
async def usage():
    """Aggregate spend across the tenant's role-scoped virtual keys.

    Managed mode issues two keys per tenant — one for the Claude reviewer,
    one for workers — both rolling up to the same billing team.
    We query /spend/logs for each and return a merged view split by role.
    """
    if os.getenv("GATEWAY_MODE", "managed") != "managed":
        return JSONResponse(
            {"mode": "byo", "detail": "Usage tracking disabled — gateway not in use."},
            status_code=200,
        )
    admin_key = os.getenv("GATEWAY_ADMIN_KEY")
    claude_key = os.getenv("CLAUDE_VIRTUAL_KEY")
    worker_key = os.getenv("WORKER_VIRTUAL_KEY")
    gateway = os.getenv("GATEWAY_URL", "https://llm.openautonomyx.com").rstrip("/")
    if not admin_key or (not claude_key and not worker_key):
        raise HTTPException(status_code=503, detail="Gateway not configured")

    async def fetch(key: str) -> list[dict]:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{gateway}/spend/logs",
                headers={"Authorization": f"Bearer {admin_key}"},
                params={"api_key": key},
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"gateway error: {resp.text[:200]}")
        data = resp.json()
        return data if isinstance(data, list) else data.get("data", [])

    claude_logs = await fetch(claude_key) if claude_key else []
    worker_logs = await fetch(worker_key) if worker_key else []

    def total(logs: list[dict]) -> dict:
        return {
            "requests": len(logs),
            "cost_usd": round(sum(r.get("spend", 0) or 0 for r in logs), 4),
            "tokens_in": sum(r.get("prompt_tokens", 0) or 0 for r in logs),
            "tokens_out": sum(r.get("completion_tokens", 0) or 0 for r in logs),
        }

    return {
        "claude": total(claude_logs),
        "worker": total(worker_logs),
        "combined": total(claude_logs + worker_logs),
        "logs": {"claude": claude_logs[-50:], "worker": worker_logs[-50:]},
    }


@app.get("/health")
async def health():
    return {"ok": True, "gateway_mode": os.getenv("GATEWAY_MODE", "managed")}


# GitHub webhook is mounted as a sub-router so it shares lifespan and lock.
from integrations.github_webhook import router as github_router  # noqa: E402

app.include_router(github_router, prefix="/webhooks/github", tags=["github"])
