"""Langflow custom component: Doc Agent (docteam)."""
from langflow.custom import Component
from langflow.io import MessageTextInput, Output
from langflow.schema import Data


class DocAgentComponent(Component):
    display_name = "Doc Agent (docteam)"
    description = "Reads a GitHub repo and generates comprehensive docs (README, API, architecture)."
    icon = "book"
    name = "DocAgent"

    inputs = [
        MessageTextInput(
            name="repo_url",
            display_name="GitHub Repo URL",
            info="e.g. https://github.com/openautonomyx/decide",
            required=True,
        ),
    ]

    outputs = [
        Output(display_name="Documentation", name="docs", method="run_docs"),
    ]

    def run_docs(self) -> Data:
        from teams.docteam.graph import graph

        state = {"input": self.repo_url, "params": {}, "retries": 0}
        final_state = graph.invoke(state)
        return Data(data=final_state)
