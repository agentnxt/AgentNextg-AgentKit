"""GitHub App webhook handler.

Triggers a review only when a user comments GITHUB_TRIGGER_COMMAND (default
"/review") on a pull request. PR diff + filesystem are fetched and placed
in a workspace dir for Worker to work against.

Security:
- HMAC-SHA256 signature verified via X-Hub-Signature-256 header.
- Rejects any event type other than 'issue_comment'.
- Only acts on PR comments (GitHub sends issue_comment for both issues
  and PRs; we filter on issue.pull_request presence).
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
from pathlib import Path

import httpx
import jwt  # PyJWT — transitive via slack-bolt OR install explicitly
from fastapi import APIRouter, Header, HTTPException, Request

import db

router = APIRouter()

TRIGGER = os.getenv("GITHUB_TRIGGER_COMMAND", "/review")


def _verify_signature(body: bytes, signature_header: str | None) -> None:
    secret = os.getenv("GITHUB_WEBHOOK_SECRET", "")
    if not secret:
        raise HTTPException(status_code=503, detail="GITHUB_WEBHOOK_SECRET not set")
    if not signature_header or not signature_header.startswith("sha256="):
        raise HTTPException(status_code=401, detail="missing signature")
    expected = "sha256=" + hmac.new(
        secret.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, signature_header):
        raise HTTPException(status_code=401, detail="bad signature")


def _app_jwt() -> str:
    """Generate a short-lived JWT for the GitHub App to authenticate."""
    app_id = os.getenv("GITHUB_APP_ID")
    key_path = os.getenv("GITHUB_APP_PRIVATE_KEY_PATH", "")
    if not app_id or not Path(key_path).exists():
        raise HTTPException(status_code=503, detail="GitHub App not configured")
    private_key = Path(key_path).read_text()
    now = int(time.time())
    payload = {"iat": now - 60, "exp": now + 540, "iss": app_id}
    return jwt.encode(payload, private_key, algorithm="RS256")


async def _installation_token(installation_id: int) -> str:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"https://api.github.com/app/installations/{installation_id}/access_tokens",
            headers={
                "Authorization": f"Bearer {_app_jwt()}",
                "Accept": "application/vnd.github+json",
            },
        )
    if resp.status_code != 201:
        raise HTTPException(status_code=502, detail=f"token error: {resp.text[:200]}")
    return resp.json()["token"]


async def _post_comment(repo_full: str, pr_number: int, token: str, body: str) -> None:
    async with httpx.AsyncClient(timeout=15) as client:
        await client.post(
            f"https://api.github.com/repos/{repo_full}/issues/{pr_number}/comments",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
            json={"body": body},
        )


@router.post("")
async def github_webhook(
    request: Request,
    x_github_event: str = Header(default=""),
    x_hub_signature_256: str = Header(default=""),
):
    raw = await request.body()
    _verify_signature(raw, x_hub_signature_256)

    if x_github_event == "ping":
        return {"ok": True, "pong": True}
    if x_github_event != "issue_comment":
        return {"ok": True, "ignored": x_github_event}

    payload = json.loads(raw)
    if payload.get("action") != "created":
        return {"ok": True, "ignored_action": payload.get("action")}
    # issue_comment fires for both issues and PRs; filter to PRs only
    if "pull_request" not in payload.get("issue", {}):
        return {"ok": True, "ignored": "not a PR comment"}
    comment_body = payload.get("comment", {}).get("body", "").strip()
    if not comment_body.startswith(TRIGGER):
        return {"ok": True, "ignored": "no trigger"}

    task_hint = comment_body[len(TRIGGER):].strip() or "Review this PR end-to-end."
    repo_full = payload["repository"]["full_name"]
    pr_number = payload["issue"]["number"]
    pr_url = payload["issue"]["pull_request"]["html_url"]
    installation_id = payload["installation"]["id"]

    token = await _installation_token(installation_id)

    task = (
        f"Review PR {pr_url} in repo {repo_full}. User request: {task_hint}\n"
        f"Clone the PR branch into a worker workspace, inspect the diff, and "
        f"apply the review rubric. Delegate any needed edits to workers."
    )
    session_id = await db.create_session(
        task=task,
        source="github",
        source_meta={
            "repo": repo_full,
            "pr": pr_number,
            "pr_url": pr_url,
            "installation_id": installation_id,
            "triggered_by": payload.get("sender", {}).get("login"),
        },
    )
    public_url = os.getenv("PUBLIC_URL", "").rstrip("/")
    acknowledgement = (
        f":mag: Review queued as `{session_id}`.\n"
        + (f"Progress: {public_url}/review/{session_id}\n" if public_url else "")
        + "I'll post a follow-up comment with the verdict when done."
    )
    await _post_comment(repo_full, pr_number, token, acknowledgement)

    # Schedule the actual run in the background via the main app's task
    # mechanism. We import lazily to avoid circular imports at module load.
    from server import _run_review_job

    import asyncio
    asyncio.create_task(_run_and_report(session_id, task, repo_full, pr_number, installation_id))

    return {"ok": True, "session_id": session_id}


async def _run_and_report(
    session_id: str, task: str, repo_full: str, pr_number: int, installation_id: int
) -> None:
    from server import _run_review_job

    await _run_review_job(session_id, task)
    session = await db.get_session(session_id)
    if session is None:
        return
    verdict = session.get("result") or "(no structured verdict captured)"
    token = await _installation_token(installation_id)
    body = (
        f"## Claude-Worker review complete\n\n"
        f"**Session:** `{session_id}`  \n"
        f"**Status:** {session['status']}\n\n"
        f"```json\n{verdict}\n```\n"
    )
    await _post_comment(repo_full, pr_number, token, body)
