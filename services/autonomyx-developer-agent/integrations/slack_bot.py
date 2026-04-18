"""Slack bot — Socket Mode, /review slash command.

Runs as a separate process from the FastAPI server (or as a sibling thread).
Slash command spawns a review, posts a threaded ack immediately, and follows
up with streamed status messages + final JSON verdict.

Socket Mode chosen over HTTP mode so this can run on a private VPS without
exposing a public HTTPS endpoint for Slack events (GitHub already needs one
for webhooks, but keeping Slack separate simplifies firewalling).
"""

from __future__ import annotations

import asyncio
import json
import os

import httpx
from dotenv import load_dotenv
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler
from slack_bolt.async_app import AsyncApp

load_dotenv()

API_BASE = f"http://{os.getenv('HOST','127.0.0.1')}:{os.getenv('PORT','8080')}"
ALLOWED_CHANNELS = {
    c.strip() for c in os.getenv("SLACK_ALLOWED_CHANNELS", "").split(",") if c.strip()
}

app = AsyncApp(token=os.getenv("SLACK_BOT_TOKEN"))


@app.command("/review")
async def handle_review(ack, command, client):
    await ack()
    channel = command.get("channel_id")
    user_id = command.get("user_id")
    task_text = (command.get("text") or "").strip()

    if ALLOWED_CHANNELS and channel not in ALLOWED_CHANNELS:
        await client.chat_postEphemeral(
            channel=channel, user=user_id,
            text="This channel isn't allowed to run reviews.",
        )
        return
    if not task_text:
        await client.chat_postEphemeral(
            channel=channel, user=user_id,
            text="Usage: `/review <task description>`",
        )
        return

    async with httpx.AsyncClient(timeout=30) as http:
        resp = await http.post(
            f"{API_BASE}/review",
            json={
                "task": task_text,
                "source": "slack",
                "source_meta": {"channel": channel, "user": user_id},
            },
        )
    if resp.status_code != 200:
        await client.chat_postMessage(
            channel=channel,
            text=f":x: Failed to queue review: {resp.text[:200]}",
        )
        return
    session_id = resp.json()["session_id"]

    parent = await client.chat_postMessage(
        channel=channel,
        text=(
            f":mag: Review queued by <@{user_id}>  \n"
            f"*Session:* `{session_id}`  \n"
            f"*Task:* {task_text}"
        ),
    )
    thread_ts = parent["ts"]

    asyncio.create_task(_stream_to_thread(client, channel, thread_ts, session_id))


async def _stream_to_thread(client, channel: str, thread_ts: str, session_id: str) -> None:
    """Subscribe to SSE and post key events into the thread."""
    url = f"{API_BASE}/review/{session_id}/events"
    try:
        async with httpx.AsyncClient(timeout=None) as http:
            async with http.stream("GET", url) as resp:
                async for raw in resp.aiter_lines():
                    if not raw or not raw.startswith("data:"):
                        continue
                    try:
                        ev = json.loads(raw[5:].strip())
                    except json.JSONDecodeError:
                        continue
                    msg = _format_event(ev)
                    if msg is None:
                        continue
                    await client.chat_postMessage(channel=channel, thread_ts=thread_ts, text=msg)
                    if ev.get("type") == "status" and ev.get("status") in ("completed", "failed"):
                        break
    except Exception as e:
        await client.chat_postMessage(
            channel=channel, thread_ts=thread_ts,
            text=f":warning: stream error: {e}",
        )


def _format_event(ev: dict) -> str | None:
    t = ev.get("type")
    if t == "tool_call":
        name = ev.get("name", "")
        args = ev.get("input") or {}
        if "spawn_worker" in name:
            return f":hammer_and_wrench: Spawning worker `{args.get('name','?')}` — {args.get('task','')[:120]}"
        if "await_worker" in name:
            return f":hourglass: Awaiting `{args.get('agent_id','?')}` result"
        return None  # skip list/read/grep noise
    if t == "text":
        text = ev.get("text", "").strip()
        return f"{text}" if text else None
    if t == "result":
        cost = ev.get("cost_usd")
        suffix = f" (cost: ${cost:.4f})" if cost else ""
        return f":white_check_mark: Review finished{suffix}"
    if t == "status" and ev.get("status") == "failed":
        return f":x: Review failed: {ev.get('error','unknown')}"
    return None


async def main() -> None:
    handler = AsyncSocketModeHandler(app, os.getenv("SLACK_APP_TOKEN"))
    await handler.start_async()


if __name__ == "__main__":
    asyncio.run(main())
