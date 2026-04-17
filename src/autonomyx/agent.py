"""
Agent — the core abstraction. Auto-provisions identity, connects to tools,
works with any LLM framework.
"""

import os
import httpx
from dataclasses import dataclass, field
from typing import Optional
from autonomyx.identity import IdentityClient, AgentCredentials
from autonomyx.tool import Tool


LLM_GATEWAY = os.environ.get("AUTONOMYX_LLM_URL", "https://llm.openautonomyx.com")


@dataclass
class Agent:
    name: str
    model: str = "claude-sonnet-4-20250514"
    tools: list[Tool] = field(default_factory=list)
    system_prompt: str = ""
    tenant_id: str = ""
    auto_provision: bool = True
    _credentials: Optional[AgentCredentials] = field(default=None, repr=False)
    _identity: Optional[IdentityClient] = field(default=None, repr=False)

    async def _ensure_provisioned(self):
        if self._credentials:
            return
        if not self.auto_provision:
            return
        self._identity = IdentityClient()
        self._credentials = await self._identity.get_or_provision(
            self.name, tenant_id=self.tenant_id,
        )

    async def run(self, prompt: str, context: str = "") -> str:
        await self._ensure_provisioned()
        return await self._run_anthropic(prompt, context)

    async def _run_anthropic(self, prompt: str, context: str) -> str:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            return await self._run_gateway(prompt, context)

        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
            tools_spec = [t.to_anthropic_tool() for t in self.tools] if self.tools else None

            messages = []
            if context:
                messages.append({"role": "user", "content": f"Context:\n{context}"})
                messages.append({"role": "assistant", "content": "Understood. I'll use this context."})
            messages.append({"role": "user", "content": prompt})

            response = client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=self.system_prompt or f"You are {self.name}.",
                messages=messages,
                tools=tools_spec,
            )
            return response.content[0].text
        except ImportError:
            return await self._run_gateway(prompt, context)

    async def _run_gateway(self, prompt: str, context: str) -> str:
        api_key = ""
        if self._credentials:
            api_key = self._credentials.api_key
        if not api_key:
            api_key = os.environ.get("AUTONOMYX_MASTER_KEY", "")

        messages = []
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})
        if context:
            messages.append({"role": "user", "content": f"Context:\n{context}"})
            messages.append({"role": "assistant", "content": "Understood."})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                f"{LLM_GATEWAY}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": self.model, "messages": messages, "max_tokens": 4096},
            )
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
            return f"Error: {r.status_code} {r.text}"

    def to_langchain(self):
        from autonomyx.adapters.langchain_adapter import to_langchain_agent
        return to_langchain_agent(self)

    def to_crewai(self):
        from autonomyx.adapters.crewai_adapter import to_crewai_agent
        return to_crewai_agent(self)
