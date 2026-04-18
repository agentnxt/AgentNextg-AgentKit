"""Image Agent — generate, edit, upscale, remove bg, describe. Routes to any model/tool."""

__version__ = "0.1.0"

from teams.imageteam.agent import ImageAgent
from teams.imageteam.api import create_app

__all__ = ["ImageAgent", "create_app"]
