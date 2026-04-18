"""Custom MCP tools Claude uses to drive workers.

The in-process MCP server exposes three tools:
- spawn_worker: fire-and-forget launch, returns agent_id immediately
- await_worker: block until an agent finishes, return diff + logs
- list_workers:  inspect all spawned agents in this session

Design note: spawn returns fast so Claude can fire multiple launches in one
turn, then await them. This maps cleanly to the Agent SDK tool-use loop and
gives Claude control over concurrency without exposing asyncio primitives.
"""

from __future__ import annotations

import asyncio
import os
from typing import Any

from claude_agent_sdk import ToolAnnotations, create_sdk_mcp_server, tool

from worker_runner import REGISTRY

AGENT_TIMEOUT = float(os.getenv("AGENT_TIMEOUT_SECONDS", "600"))


@tool(
    "spawn_worker",
    "Launch a background worker to implement a coding task. "
    "Returns an agent_id immediately; call await_worker later to "
    "retrieve the diff. Use multiple spawns in one turn for parallel work.",
    {"task": str, "name": str},
)
async def spawn_worker(args: dict[str, Any]) -> dict[str, Any]:
    try:
        handle = await REGISTRY.spawn(task=args["task"], name=args["name"])
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"Failed to spawn: {e}"}],
            "is_error": True,
        }
    return {
        "content": [
            {
                "type": "text",
                "text": (
                    f"Spawned agent_id={handle.agent_id} name={handle.name} "
                    f"pid={handle.process.pid} workspace={handle.workspace}"
                ),
            }
        ]
    }


@tool(
    "await_worker",
    "Block until the named worker finishes, then return its diff, "
    "stdout tail, stderr tail, and exit code. Call once per agent_id.",
    {"agent_id": str},
    annotations=ToolAnnotations(readOnlyHint=True),
)
async def await_worker(args: dict[str, Any]) -> dict[str, Any]:
    agent_id = args["agent_id"]
    try:
        handle = await REGISTRY.wait(agent_id, timeout=AGENT_TIMEOUT)
    except KeyError:
        return {
            "content": [{"type": "text", "text": f"Unknown agent_id: {agent_id}"}],
            "is_error": True,
        }
    except TimeoutError:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Agent {agent_id} exceeded {AGENT_TIMEOUT}s timeout and was killed.",
                }
            ],
            "is_error": True,
        }

    diff = await _collect_git_diff(str(handle.workspace))
    stdout_tail = "\n".join(handle.stdout_buf[-50:])
    stderr_tail = "\n".join(handle.stderr_buf[-50:])

    summary = (
        f"agent_id: {handle.agent_id}\n"
        f"name: {handle.name}\n"
        f"exit_code: {handle.returncode}\n"
        f"workspace: {handle.workspace}\n"
        f"--- DIFF ---\n{diff or '(no git diff produced)'}\n"
        f"--- STDOUT (tail) ---\n{stdout_tail}\n"
        f"--- STDERR (tail) ---\n{stderr_tail}\n"
    )
    return {"content": [{"type": "text", "text": summary}]}


@tool(
    "list_workers",
    "List all workers spawned in this session with their status.",
    {},
    annotations=ToolAnnotations(readOnlyHint=True),
)
async def list_workers(args: dict[str, Any]) -> dict[str, Any]:
    rows = []
    for h in REGISTRY.all():
        status = "running" if h.returncode is None else f"exit={h.returncode}"
        rows.append(f"{h.agent_id}  {h.name:<20}  {status}")
    text = "\n".join(rows) if rows else "(no agents spawned yet)"
    return {"content": [{"type": "text", "text": text}]}


async def _collect_git_diff(workspace: str) -> str:
    """Best-effort: if the workspace is a git repo, show the diff Worker made.

    Async so parallel agents are not blocked on the event loop during diff reads.
    argv-based, no shell.
    """
    try:
        proc = await asyncio.create_subprocess_exec(
            "git", "-C", workspace, "diff", "--no-color",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        try:
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=10)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            return ""
        return stdout.decode("utf-8", errors="replace")[:8000]
    except (OSError, asyncio.CancelledError):
        return ""


worker_server = create_sdk_mcp_server(
    name="worker",
    version="0.1.0",
    tools=[spawn_worker, await_worker, list_workers],
)
