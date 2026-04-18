"""
Imageteam LangGraph wrapper.

The imageteam already has its own LangGraph inside `teams/imageteam/agent.py`
(classify_intent → route_to_tool → execute_tool → format_result). This file
exposes it via the unified AgentState shape so Langflow + agentkit see all
three teams uniformly.
"""
from langgraph.graph import StateGraph, END

from teams._shared.state import AgentState


def execute_imageteam(state: AgentState) -> AgentState:
    """Delegate to the existing ImageAgent pipeline."""
    from teams.imageteam.agent import ImageAgent

    agent = ImageAgent()
    user_input = state.get("input", "")
    params = state.get("params") or {}
    image_b64 = params.get("image_b64", "")

    result = agent.run(user_input=user_input, image_b64=image_b64)
    return {
        **state,
        "result": result,
        "output": f"[imageteam] {result.get('intent','?')} → {result.get('tool','?')}",
    }


def build_graph():
    g = StateGraph(AgentState)
    g.add_node("execute", execute_imageteam)
    g.set_entry_point("execute")
    g.add_edge("execute", END)
    return g.compile()


graph = build_graph()
