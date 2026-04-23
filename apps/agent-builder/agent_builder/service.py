from __future__ import annotations

from dataclasses import dataclass

from .models import ALLOWED_TRANSITIONS, AgentDefinition, AgentStatus, AgentTransitionRequest, ValidationReport
from .storage import AgentRepository
from .validation import validate_for_status


@dataclass
class AgentService:
    repository: AgentRepository

    def create_or_update(self, agent: AgentDefinition) -> tuple[AgentDefinition, object]:
        report = validate_for_status(agent)
        if not report.valid and agent.status != AgentStatus.DRAFT:
            raise ValueError("Agent cannot be persisted in invalid non-draft state")
        save_result = self.repository.save(agent)
        return agent, save_result

    def list_agents(self):
        return self.repository.list_agents()

    def get(self, agent_id: str, version: str | None = None) -> AgentDefinition:
        return self.repository.get(agent_id=agent_id, version=version)

    def validate(self, agent: AgentDefinition, target: AgentStatus | None = None) -> ValidationReport:
        return validate_for_status(agent, target)

    def transition(self, agent_id: str, req: AgentTransitionRequest) -> tuple[AgentDefinition, object]:
        agent = self.repository.get(agent_id)
        allowed = ALLOWED_TRANSITIONS[agent.status]
        if req.target_status not in allowed:
            raise ValueError(f"Invalid lifecycle transition: {agent.status} -> {req.target_status}")
        report = validate_for_status(agent, req.target_status)
        if not report.valid:
            raise ValueError("Transition blocked by validation: " + "; ".join(report.errors))
        agent.status = req.target_status
        save_result = self.repository.save(agent)
        return agent, save_result
