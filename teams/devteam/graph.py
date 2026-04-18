"""
Devteam (coder) LangGraph wrapper.

Wraps the existing EngineeringTeam pipeline (HLD → architecture review → code
→ review → security → merge) as a single LangGraph node, exposing the unified
AgentState. This gives Langflow + the rest of agentkit one consistent surface.
"""
from typing import Any
from langgraph.graph import StateGraph, END

from teams._shared.state import AgentState


def execute_devteam(state: AgentState) -> AgentState:
    """Run the full engineering pipeline for a given requirement."""
    from teams.devteam.team import EngineeringTeam  # local import to keep graph import cheap

    requirement = state.get("input", "")
    team = EngineeringTeam()
    pipeline_result = team.run(requirement)  # returns PipelineResult

    return {
        **state,
        "result": pipeline_result.to_dict() if hasattr(pipeline_result, "to_dict") else pipeline_result,
        "output": f"[devteam] completed — status={getattr(pipeline_result, 'final_status', 'unknown')}, "
                  f"iterations={getattr(pipeline_result, 'iterations', 0)}",
    }


def build_graph():
    """Compile the devteam graph."""
    g = StateGraph(AgentState)
    g.add_node("execute", execute_devteam)
    g.set_entry_point("execute")
    g.add_edge("execute", END)
    return g.compile()


graph = build_graph()
