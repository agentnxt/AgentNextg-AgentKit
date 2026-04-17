"""
Tool — connects to MCP skills from the Autonomyx registry.
"""

import os
import httpx
from dataclasses import dataclass, field
from typing import Callable, Optional


REGISTRY_URL = os.environ.get("AUTONOMYX_REGISTRY_URL", "https://registry.unboxd.cloud")
GATEWAY_URL = os.environ.get("AUTONOMYX_GATEWAY_URL", "https://api.unboxd.cloud")


@dataclass
class Tool:
    name: str
    description: str = ""
    func: Optional[Callable] = None
    mcp_url: Optional[str] = None

    @staticmethod
    def mcp(skill_name: str, description: str = "") -> "Tool":
        return Tool(
            name=skill_name,
            description=description or f"MCP skill: {skill_name}",
            mcp_url=f"{GATEWAY_URL}/{skill_name}",
        )

    @staticmethod
    def function(name: str, func: Callable, description: str = "") -> "Tool":
        return Tool(name=name, description=description or func.__doc__ or "", func=func)

    async def call(self, **kwargs) -> str:
        if self.func:
            result = self.func(**kwargs)
            if hasattr(result, "__await__"):
                return str(await result)
            return str(result)

        if self.mcp_url:
            async with httpx.AsyncClient(timeout=60) as client:
                r = await client.post(
                    f"{self.mcp_url}/tools/call",
                    json={"name": self.name, "arguments": kwargs},
                )
                if r.status_code == 200:
                    return str(r.json())
                return f"Error: {r.status_code} {r.text}"

        return "No implementation"

    def to_anthropic_tool(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {"type": "object", "properties": {}},
        }

    def to_langchain_tool(self):
        from langchain.tools import StructuredTool
        return StructuredTool.from_function(
            func=lambda **kw: self.call(**kw),
            name=self.name,
            description=self.description,
        )
