"""
Autonomyx ADK — One SDK, all agent frameworks.

Usage:
    from autonomyx import Agent, Tool, Workflow

    agent = Agent(
        name="my-agent",
        model="claude-sonnet-4-20250514",
        tools=[Tool.mcp("skill-searxng")],
    )
    result = await agent.run("Research this topic")
"""

__version__ = "0.1.0"

from autonomyx.agent import Agent
from autonomyx.tool import Tool
from autonomyx.workflow import Workflow
from autonomyx.identity import IdentityClient

__all__ = ["Agent", "Tool", "Workflow", "IdentityClient"]
