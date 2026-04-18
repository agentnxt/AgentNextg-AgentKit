"""SQLite session log for review runs.

Stores task metadata only — cost data lives in the LiteLLM gateway and is
fetched on demand by the /usage endpoint. Keeping cost out of here avoids
double-bookkeeping and keeps the gateway as the single source of truth.
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import aiosqlite

DB_PATH = Path(os.getenv("DATABASE_PATH", "./review_sessions.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS review_sessions (
    id              TEXT PRIMARY KEY,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('pending','running','completed','failed')),
    source          TEXT NOT NULL,              -- 'cli' | 'api' | 'slack' | 'github' | 'vscode'
    source_meta     TEXT,                       -- JSON: channel, PR URL, user id, etc.
    task            TEXT NOT NULL,
    events          TEXT NOT NULL DEFAULT '[]', -- JSON array of streamed events
    result          TEXT,                       -- final JSON decision from Claude
    error           TEXT,
    claude_cost_usd REAL                        -- best-effort; gateway has authoritative numbers
);

CREATE INDEX IF NOT EXISTS idx_sessions_created ON review_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status  ON review_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_source  ON review_sessions(source);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(SCHEMA)
        await db.commit()


async def create_session(task: str, source: str, source_meta: dict | None = None) -> str:
    session_id = f"rs-{uuid.uuid4().hex[:12]}"
    now = now_iso()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO review_sessions
               (id, created_at, updated_at, status, source, source_meta, task)
               VALUES (?, ?, ?, 'pending', ?, ?, ?)""",
            (session_id, now, now, source, json.dumps(source_meta or {}), task),
        )
        await db.commit()
    return session_id


async def set_status(session_id: str, status: str, error: str | None = None) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE review_sessions SET status=?, error=?, updated_at=? WHERE id=?",
            (status, error, now_iso(), session_id),
        )
        await db.commit()


async def append_event(session_id: str, event: dict) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        row = await (await db.execute(
            "SELECT events FROM review_sessions WHERE id=?", (session_id,)
        )).fetchone()
        if row is None:
            return
        events = json.loads(row[0])
        events.append(event)
        await db.execute(
            "UPDATE review_sessions SET events=?, updated_at=? WHERE id=?",
            (json.dumps(events), now_iso(), session_id),
        )
        await db.commit()


async def finalize_session(session_id: str, result: str | None, cost_usd: float | None) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """UPDATE review_sessions
               SET status='completed', result=?, claude_cost_usd=?, updated_at=?
               WHERE id=?""",
            (result, cost_usd, now_iso(), session_id),
        )
        await db.commit()


async def get_session(session_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        row = await (await db.execute(
            "SELECT * FROM review_sessions WHERE id=?", (session_id,)
        )).fetchone()
        if row is None:
            return None
        d = dict(row)
        d["events"] = json.loads(d["events"])
        d["source_meta"] = json.loads(d["source_meta"] or "{}")
        return d


async def list_sessions(limit: int = 100) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        rows = await (await db.execute(
            """SELECT id, created_at, status, source, task, claude_cost_usd
               FROM review_sessions ORDER BY created_at DESC LIMIT ?""",
            (limit,),
        )).fetchall()
        return [dict(r) for r in rows]
