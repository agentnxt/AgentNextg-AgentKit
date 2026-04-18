"""
Docteam LangGraph wrapper.

Wraps DocAgent (repo → documentation) as a single LangGraph node so it shares
the unified AgentState shape with the other teams.
"""
from langgraph.graph import StateGraph, END

from teams._shared.state import AgentState


def execute_docteam(state: AgentState) -> AgentState:
    """Generate documentation for a repo described in state['input'] or state['params']."""
    from teams.docteam.agent import DocAgent

    agent = DocAgent()
    # Accept either a repo URL in input OR owner/repo in params
    params = state.get("params") or {}
    owner = params.get("owner")
    repo = params.get("repo")

    if not (owner and repo):
        # Very light URL parser: github.com/<owner>/<repo>
        url = state.get("input", "")
        if "github.com" in url:
            parts = url.rstrip("/").split("github.com/")[-1].split("/")
            if len(parts) >= 2:
                owner, repo = parts[0], parts[1]

    if not (owner and repo):
        return {**state, "error": "docteam: need owner/repo in params or github URL in input"}

    docs = agent.generate_docs(owner=owner, repo=repo)
    return {
        **state,
        "result": docs,
        "output": f"[docteam] generated docs for {owner}/{repo}",
    }


def build_graph():
    g = StateGraph(AgentState)
    g.add_node("execute", execute_docteam)
    g.set_entry_point("execute")
    g.add_edge("execute", END)
    return g.compile()


graph = build_graph()
