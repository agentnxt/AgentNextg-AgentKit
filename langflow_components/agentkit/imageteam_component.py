"""Langflow custom component: Image Agent (imageteam)."""
from langflow.custom import Component
from langflow.io import MultilineInput, MessageTextInput, Output
from langflow.schema import Data


class ImageAgentComponent(Component):
    display_name = "Image Agent (imageteam)"
    description = "Routes to the right image tool: generate, edit, upscale, remove-bg, describe."
    icon = "image"
    name = "ImageAgent"

    inputs = [
        MultilineInput(
            name="prompt",
            display_name="Prompt",
            info="Description of the image or edit action.",
            required=True,
        ),
        MessageTextInput(
            name="image_b64",
            display_name="Input Image (base64, optional)",
            info="Required only for edit/upscale/remove-bg operations.",
            required=False,
        ),
    ]

    outputs = [
        Output(display_name="Image Result", name="result", method="run_image"),
    ]

    def run_image(self) -> Data:
        from teams.imageteam.graph import graph

        state = {
            "input": self.prompt,
            "params": {"image_b64": self.image_b64 or ""},
            "retries": 0,
        }
        final_state = graph.invoke(state)
        return Data(data=final_state)
