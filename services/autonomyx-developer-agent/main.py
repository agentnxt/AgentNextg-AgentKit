"""Claude-as-reviewer orchestrator.

Claude never writes code. It delegates implementation to workers
(which run on a LOCAL model via the gateway), inspects their diffs with
read-only tools, and approves or rejects against a review rubric.
"""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
)
from claude_agent_sdk.types import (
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)
from dotenv import load_dotenv

from worker_tools import worker_server
from review_criteria import get_review_criteria

load_dotenv()


def _wire_managed_keys() -> None:
    """In managed mode, map role-scoped virtual keys into the env vars the
    underlying SDKs read. The Anthropic SDK reads ANTHROPIC_API_KEY and
    ANTHROPIC_BASE_URL; we set both from CLAUDE_VIRTUAL_KEY + GATEWAY_URL.
    """
    if os.getenv("GATEWAY_MODE", "managed") != "managed":
        return
    claude_key = os.getenv("CLAUDE_VIRTUAL_KEY")
    gateway_url = os.getenv("GATEWAY_URL", "").rstrip("/")
    if claude_key:
        os.environ["ANTHROPIC_API_KEY"] = claude_key
    if gateway_url and not os.getenv("ANTHROPIC_BASE_URL"):
        os.environ["ANTHROPIC_BASE_URL"] = f"{gateway_url}/anthropic"


_wire_managed_keys()


def _workspaces_root() -> Path:
    return Path(os.getenv("WORKSPACES_DIR", "./workspaces")).resolve()


async def workspace_only_permission(
    tool_name: str,
    input_data: dict,
    context: ToolPermissionContext,
) -> PermissionResultAllow | PermissionResultDeny:
    """Allow Read/Grep/Glob only when the target path lives under WORKSPACES_DIR.

    Deny rules and MCP tool allow rules are evaluated BEFORE this callback
    runs, so this only gates the path-based built-ins that fall through.
    """
    path_arg = input_data.get("file_path") or input_data.get("path") or ""
    if not path_arg:
        # Grep/Glob with no path defaults to cwd — allow, since cwd is the project dir
        return PermissionResultAllow(updated_input=input_data)
    try:
        target = Path(path_arg).resolve()
        if target.is_relative_to(_workspaces_root()):
            return PermissionResultAllow(updated_input=input_data)
    except (OSError, ValueError):
        pass
    return PermissionResultDeny(
        message=(
            f"Access denied: '{path_arg}' is outside the workspaces dir. "
            f"Reviewer can only inspect files produced by workers "
            f"under {_workspaces_root()}."
        )
    )


async def _keepalive_hook(input_data, tool_use_id, context):
    """Required by the Python SDK to keep the stream open for can_use_tool."""
    return {"continue_": True}


SYSTEM_PROMPT = f"""
You are a senior code reviewer operating in delegate-and-review mode.

You NEVER write or edit code directly. Your only implementation channel is
spawning workers via the `mcp__worker__spawn_worker`
tool. You may read files to inspect what a worker produced, but any change
to source files must come from an worker.

Workflow for every user request:
1. Decompose the request into independent sub-tasks if it is large enough to
   parallelize (2+ workers). Otherwise a single spawn is fine.
2. Call `spawn_worker` for each sub-task. Fire all spawns in a
   single turn so they run in parallel.
3. Call `await_worker` for each agent_id to collect diffs.
4. Review each diff against the rubric below. For each worker, output one
   of: APPROVED, CHANGES_REQUESTED (with specific required edits), or
   REJECTED (with reason). Structure your final message as JSON.

Review rubric:
{get_review_criteria()}

You may use Read, Grep, and Glob to inspect files in a worker's workspace.
You do NOT have Write, Edit, or Bash. If you find yourself wanting to fix
something directly, instead dispatch a follow-up worker with a
precise instruction.
""".strip()


async def run_review_stream(user_task: str, session_id: str | None = None):
    """Run a single review and yield event dicts as they happen.

    Events yielded (each a dict):
      {"type": "text",      "text": str}
      {"type": "tool_call", "name": str, "input": dict}
      {"type": "result",    "cost_usd": float|None, "input_tokens": int|None,
                            "output_tokens": int|None, "subtype": str,
                            "result": str|None}

    Consumers (CLI, FastAPI, Slack, GitHub) all iterate this. The session_id
    is passed through to workers via env var so LiteLLM can attribute
    their token usage back to this review.
    """
    options = ClaudeAgentOptions(
        mcp_servers={"worker": worker_server},
        allowed_tools=[
            "mcp__worker__spawn_worker",
            "mcp__worker__await_worker",
            "mcp__worker__list_workers",
        ],
        disallowed_tools=["Write", "Edit", "NotebookEdit", "Bash"],
        system_prompt=SYSTEM_PROMPT,
        model=os.getenv("CLAUDE_MODEL"),
        permission_mode="default",
        can_use_tool=workspace_only_permission,
        hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[_keepalive_hook])]},
    )

    # Propagate session_id so Worker tool (-> LiteLLM) can tag requests.
    if session_id:
        os.environ["REVIEW_SESSION_ID"] = session_id

    async with ClaudeSDKClient(options=options) as client:
        await client.query(user_task)

        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        yield {"type": "text", "text": block.text}
                    elif isinstance(block, ToolUseBlock):
                        yield {"type": "tool_call", "name": block.name, "input": block.input}
            elif isinstance(message, ResultMessage):
                yield {
                    "type": "result",
                    "cost_usd": message.total_cost_usd,
                    "input_tokens": getattr(message.usage, "input_tokens", None) if message.usage else None,
                    "output_tokens": getattr(message.usage, "output_tokens", None) if message.usage else None,
                    "subtype": message.subtype,
                    "result": message.result if hasattr(message, "result") else None,
                }


async def run_cli(user_task: str) -> None:
    async for ev in run_review_stream(user_task):
        if ev["type"] == "text":
            print(f"\n[claude] {ev['text']}")
        elif ev["type"] == "tool_call":
            print(f"[tool-call] {ev['name']} {ev['input']}")
        elif ev["type"] == "result" and ev["cost_usd"] is not None:
            print(f"\n[cost] ${ev['cost_usd']:.4f}")


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: python main.py \"<task to delegate>\"", file=sys.stderr)
        sys.exit(2)
    task = " ".join(sys.argv[1:])
    asyncio.run(run_cli(task))


if __name__ == "__main__":
    main()
