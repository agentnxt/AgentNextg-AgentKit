from __future__ import annotations

from .models import AgentDefinition, AgentStatus, ValidationReport


def validate_for_status(agent: AgentDefinition, target: AgentStatus | None = None) -> ValidationReport:
    errors: list[str] = []
    desired_status = target or agent.status

    if desired_status in {AgentStatus.VALIDATED, AgentStatus.RELEASED}:
        if len(agent.skill_refs) == 0:
            errors.append("Validated/Released agents must reference at least one skill")
        if "owner" not in agent.policy_metadata:
            errors.append("policy_metadata.owner is required for validated/released agents")

    if desired_status == AgentStatus.RELEASED:
        if not agent.policy_metadata.get("approval_ticket"):
            errors.append("Released agents require policy_metadata.approval_ticket")

    return ValidationReport(valid=len(errors) == 0, errors=errors)
