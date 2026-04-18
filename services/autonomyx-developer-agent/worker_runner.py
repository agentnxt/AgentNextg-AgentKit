"""Spawn and track worker subprocesses.

Each worker runs in its own workspace dir so parallel agents don't clobber
each other. Worker is configured via env vars to use the LOCAL model
gateway only — never the Anthropic API.

Security: uses asyncio.create_subprocess_exec with an argv list (no shell).
The command template is split with shlex so user-provided task text lands
as a single argv element, not as a shell-interpolated string.
"""

from __future__ import annotations

import asyncio
import os
import shlex
import uuid
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class AgentHandle:
    agent_id: str
    name: str
    task: str
    workspace: Path
    process: asyncio.subprocess.Process
    started_at: float
    stdout_buf: list[str] = field(default_factory=list)
    stderr_buf: list[str] = field(default_factory=list)
    returncode: int | None = None
    drain_task: asyncio.Task | None = None


class WorkerRegistry:
    """In-memory registry of spawned agents for the current SDK session."""

    def __init__(self) -> None:
        self._agents: dict[str, AgentHandle] = {}
        self._sem = asyncio.Semaphore(
            int(os.getenv("MAX_CONCURRENT_AGENTS", "3"))
        )

    async def spawn(self, task: str, name: str) -> AgentHandle:
        agent_id = f"oh-{uuid.uuid4().hex[:8]}"
        workspaces_root = Path(os.getenv("WORKSPACES_DIR", "./workspaces")).resolve()
        workspace = workspaces_root / agent_id
        workspace.mkdir(parents=True, exist_ok=True)

        cmd_template = os.getenv("WORKER_CMD")
        if not cmd_template:
            raise RuntimeError("WORKER_CMD env var is required")

        argv_template = shlex.split(cmd_template)
        argv = [
            part.replace("{task}", task).replace("{workspace}", str(workspace))
            for part in argv_template
        ]

        child_env = os.environ.copy()
        child_env["WORKSPACE_BASE"] = str(workspace)

        # In managed mode, wire the worker subprocess to use the
        # Worker-scoped virtual key — NOT the reviewer's key. The gateway
        # enforces a model allowlist on this key so the worker can't call
        # Claude models even if the task tried to.
        if os.environ.get("GATEWAY_MODE", "managed") == "managed":
            oh_key = os.environ.get("WORKER_VIRTUAL_KEY")
            if oh_key:
                child_env["LLM_API_KEY"] = oh_key

        # Tag this worker's LLM calls so LiteLLM attributes spend to the
        # parent review session.
        session_id = os.environ.get("REVIEW_SESSION_ID")
        if session_id:
            child_env["LITELLM_USER"] = f"review:{session_id}"
            child_env["LITELLM_METADATA"] = (
                f'{{"session_id":"{session_id}","agent_id":"{agent_id}","agent_name":"{name}"}}'
            )

        await self._sem.acquire()
        try:
            proc = await asyncio.create_subprocess_exec(
                *argv,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(workspace),
                env=child_env,
            )
        except Exception:
            self._sem.release()
            raise

        handle = AgentHandle(
            agent_id=agent_id,
            name=name,
            task=task,
            workspace=workspace,
            process=proc,
            started_at=asyncio.get_running_loop().time(),
        )
        self._agents[agent_id] = handle
        handle.drain_task = asyncio.create_task(self._drain(handle))
        return handle

    async def _drain(self, handle: AgentHandle) -> None:
        async def read_stream(stream: asyncio.StreamReader | None, buf: list[str]) -> None:
            if stream is None:
                return
            while True:
                line = await stream.readline()
                if not line:
                    return
                buf.append(line.decode("utf-8", errors="replace").rstrip())

        try:
            await asyncio.gather(
                read_stream(handle.process.stdout, handle.stdout_buf),
                read_stream(handle.process.stderr, handle.stderr_buf),
            )
            handle.returncode = await handle.process.wait()
        finally:
            self._sem.release()

    async def wait(self, agent_id: str, timeout: float) -> AgentHandle:
        handle = self._agents.get(agent_id)
        if handle is None:
            raise KeyError(f"unknown agent_id: {agent_id}")
        # Await the single drain task rather than calling process.wait()
        # concurrently from two coroutines. The drain task handles process
        # exit + stream consumption + semaphore release.
        assert handle.drain_task is not None
        try:
            await asyncio.wait_for(asyncio.shield(handle.drain_task), timeout=timeout)
        except asyncio.TimeoutError:
            handle.process.kill()
            # Reap the zombie and let _drain release the semaphore.
            try:
                await asyncio.wait_for(handle.drain_task, timeout=5)
            except asyncio.TimeoutError:
                pass
            raise
        return handle

    def get(self, agent_id: str) -> AgentHandle | None:
        return self._agents.get(agent_id)

    def all(self) -> list[AgentHandle]:
        return list(self._agents.values())


REGISTRY = WorkerRegistry()
