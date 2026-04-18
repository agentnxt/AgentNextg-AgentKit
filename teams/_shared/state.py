"""
Unified state shape for all agentkit teams.

Every team's LangGraph graph operates over this TypedDict, so Langflow components
can be composed uniformly.
"""
from typing import Any, Optional, TypedDict


class AgentState(TypedDict, total=False):
    # Input
    input: str                    # User request text
    params: dict                  # Team-specific extra params (image_b64, repo_url, etc.)

    # Routing / orchestration
    intent: Optional[str]         # classified user intent (e.g. "generate", "edit", "review")
    tool: Optional[str]           # selected tool/sub-agent name
    tool_args: dict               # args passed to tool

    # Execution
    result: Any                   # raw tool/agent output
    output: Optional[str]         # normalized string output for display

    # Error handling
    error: Optional[str]
    retries: int

    # Governance (plugs into Decide control plane when wired)
    tenant_id: Optional[str]
    thread_id: Optional[str]
    execution_request_id: Optional[str]
