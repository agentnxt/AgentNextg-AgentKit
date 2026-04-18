"""Engineering Agent Team — AI-powered software engineering workflow."""

__version__ = "0.1.0"

from teams.devteam.team import EngineeringTeam
from teams.devteam.agents import (
    AgentCodeDeveloper,
    ClaudeArchitect,
    ClaudeReviewer,
    ClaudeSecurityAuditor,
    ClaudeMergeManager,
)

__all__ = [
    "EngineeringTeam",
    "AgentCodeDeveloper",
    "ClaudeArchitect",
    "ClaudeReviewer",
    "ClaudeSecurityAuditor",
    "ClaudeMergeManager",
]
