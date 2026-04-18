"""Langflow custom component: Coder (devteam)."""
from langflow.custom import Component
from langflow.io import MultilineInput, Output
from langflow.schema import Data


class CoderAgentComponent(Component):
    display_name = "Coder Agent (devteam)"
    description = "Full engineering pipeline: HLD → architecture → code → review → security → merge."
    icon = "code"
    name = "CoderAgent"

    inputs = [
        MultilineInput(
            name="requirement",
            display_name="Requirement",
            info="Plain-English description of what to build.",
            required=True,
        ),
    ]

    outputs = [
        Output(display_name="Pipeline Result", name="result", method="run_pipeline"),
    ]

    def run_pipeline(self) -> Data:
        from teams.devteam.graph import graph

        state = {"input": self.requirement, "params": {}, "retries": 0}
        final_state = graph.invoke(state)
        return Data(data=final_state)
