"""
Identity client — auto-provisions agents in the Autonomyx Identity Platform.
Handles registration, key management, auth headers.
"""

import os
import httpx
from dataclasses import dataclass
from typing import Optional


@dataclass
class AgentCredentials:
    agent_id: str
    agent_name: str
    api_key: str
    tenant_id: str
    status: str


class IdentityClient:
    """Client for the Autonomyx Identity API."""

    def __init__(
        self,
        api_url: str = None,
        master_key: str = None,
    ):
        self.api_url = api_url or os.environ.get("AUTONOMYX_API_URL", "https://api.unboxd.cloud/identity")
        self.master_key = master_key or os.environ.get("AUTONOMYX_MASTER_KEY", "")

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.master_key}",
            "Content-Type": "application/json",
        }

    async def provision(
        self,
        agent_name: str,
        agent_type: str = "workflow",
        tenant_id: str = "",
        sponsor_id: str = "",
        allowed_models: list[str] = None,
        budget_limit: float = None,
    ) -> AgentCredentials:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{self.api_url}/agents/create",
                headers=self._headers(),
                json={
                    "agent_name": agent_name,
                    "agent_type": agent_type,
                    "tenant_id": tenant_id or os.environ.get("AUTONOMYX_TENANT_ID", "default"),
                    "sponsor_id": sponsor_id or os.environ.get("AUTONOMYX_SPONSOR_ID", "adk"),
                    "allowed_models": allowed_models,
                    "budget_limit": budget_limit,
                },
            )
            if r.status_code == 200:
                data = r.json()
                return AgentCredentials(
                    agent_id=data["agent_id"],
                    agent_name=data["agent_name"],
                    api_key=data["litellm_key"],
                    tenant_id=data["tenant_id"],
                    status=data["status"],
                )
            raise RuntimeError(f"Failed to provision agent: {r.text}")

    async def get_or_provision(self, agent_name: str, **kwargs) -> AgentCredentials:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{self.api_url}/agents",
                headers=self._headers(),
                params={"agent_name": agent_name},
            )
            if r.status_code == 200:
                agents = r.json()
                for a in agents:
                    if a["agent_name"] == agent_name and a["status"] == "active":
                        return AgentCredentials(
                            agent_id=a["agent_id"],
                            agent_name=a["agent_name"],
                            api_key="",
                            tenant_id=a["tenant_id"],
                            status=a["status"],
                        )
        return await self.provision(agent_name, **kwargs)

    async def suspend(self, agent_id: str):
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(f"{self.api_url}/agents/{agent_id}/suspend", headers=self._headers())

    async def revoke(self, agent_id: str):
        async with httpx.AsyncClient(timeout=10) as client:
            await client.delete(f"{self.api_url}/agents/{agent_id}", headers=self._headers())
