"""
Identity mixin — every agent team registers with Autonomyx Identity Platform.
Agents can tell their identity, show credentials status, and verify auth.
"""

import os
import json
from dataclasses import dataclass


IDENTITY_URL = os.environ.get("AUTONOMYX_API_URL", "https://api.unboxd.cloud/identity")
MASTER_KEY = os.environ.get("AUTONOMYX_MASTER_KEY", "")


@dataclass
class AgentIdentityCard:
    agent_name: str
    agent_type: str
    team: str
    capabilities: list
    model: str
    tenant_id: str = ""
    agent_id: str = ""
    status: str = "unregistered"

    def announce(self) -> str:
        return json.dumps({
            "identity": {
                "agent_name": self.agent_name,
                "agent_id": self.agent_id or "not-registered",
                "agent_type": self.agent_type,
                "team": self.team,
                "status": self.status,
                "tenant_id": self.tenant_id,
            },
            "capabilities": self.capabilities,
            "model": self.model,
            "identity_platform": IDENTITY_URL,
        }, indent=2)


async def register_agent(card: AgentIdentityCard) -> AgentIdentityCard:
    """Register this agent with the identity platform."""
    import httpx
    if not MASTER_KEY:
        card.status = "no-credentials"
        return card

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                f"{IDENTITY_URL}/agents/create",
                headers={"Authorization": f"Bearer {MASTER_KEY}", "Content-Type": "application/json"},
                json={
                    "agent_name": card.agent_name,
                    "agent_type": card.agent_type,
                    "sponsor_id": "agentkit",
                    "tenant_id": card.tenant_id or os.environ.get("AUTONOMYX_TENANT_ID", "agentnxt"),
                    "metadata": {"team": card.team, "capabilities": card.capabilities},
                },
            )
            if r.status_code == 200:
                data = r.json()
                card.agent_id = data["agent_id"]
                card.status = "active"
                card.tenant_id = data["tenant_id"]
                return card
    except Exception as e:
        card.status = f"registration-failed: {e}"

    return card


# Pre-defined identity cards for all teams
AGENT_CARDS = {
    "dev-lead": AgentIdentityCard(
        agent_name="dev-lead", agent_type="workflow", team="devteam",
        capabilities=["hld", "code", "tests", "api_design"],
        model="claude-sonnet-4-20250514",
    ),
    "architect": AgentIdentityCard(
        agent_name="architect", agent_type="workflow", team="devteam",
        capabilities=["architecture_review", "tech_decisions"],
        model="claude-opus-4-20250514",
    ),
    "reviewer": AgentIdentityCard(
        agent_name="code-reviewer", agent_type="workflow", team="devteam",
        capabilities=["pr_review", "test_review"],
        model="claude-opus-4-20250514",
    ),
    "security": AgentIdentityCard(
        agent_name="security-auditor", agent_type="workflow", team="devteam",
        capabilities=["vulnerability_scan", "owasp_audit"],
        model="claude-opus-4-20250514",
    ),
    "merge-manager": AgentIdentityCard(
        agent_name="merge-manager", agent_type="workflow", team="devteam",
        capabilities=["merge_decision", "release_management"],
        model="claude-opus-4-20250514",
    ),
    "image-agent": AgentIdentityCard(
        agent_name="image-agent", agent_type="workflow", team="imageteam",
        capabilities=["generate", "edit", "upscale", "remove_bg", "describe", "publish"],
        model="claude-haiku-4-5-20251001",
    ),
    "crew-orchestrator": AgentIdentityCard(
        agent_name="crew-orchestrator", agent_type="workflow", team="crewteam",
        capabilities=["multi_agent", "task_orchestration"],
        model="ollama/qwen3:30b-a3b",
    ),
    "doc-agent": AgentIdentityCard(
        agent_name="doc-agent", agent_type="workflow", team="docteam",
        capabilities=["readme", "api_docs", "architecture", "changelog"],
        model="ollama/qwen3:30b-a3b",
    ),
    "content-writer": AgentIdentityCard(
        agent_name="content-writer", agent_type="workflow", team="contentteam",
        capabilities=["research", "write", "repurpose", "seo"],
        model="ollama/qwen3:30b-a3b",
    ),
}


async def register_all_agents() -> dict:
    """Register all pre-defined agents with the identity platform."""
    results = {}
    for name, card in AGENT_CARDS.items():
        registered = await register_agent(card)
        results[name] = {
            "agent_id": registered.agent_id,
            "status": registered.status,
        }
        print(f"  [{registered.status}] {name}: {registered.agent_id or 'failed'}")
    return results
