from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from agent_builder.models import AgentDefinition, AgentStatus, AgentTransitionRequest, RuntimeConfig
from agent_builder.service import AgentService
from agent_builder.storage import AgentRepository


def _agent(status: AgentStatus = AgentStatus.DRAFT) -> AgentDefinition:
    return AgentDefinition(
        agent_id="incident-agent",
        name="Incident Agent",
        version="v1.0.0",
        status=status,
        model_refs=["model-registry/gpt-4.1"],
        prompt_refs=["prompt-registry/incidents/v1"],
        skill_refs=["skill-registry/incident"],
        tool_refs=["mcp-registry/github"],
        runtime_config=RuntimeConfig(framework="langgraph"),
        policy_metadata={"owner": "platform", "approval_ticket": "CHG-1"},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


def test_storage_round_trip(tmp_path: Path):
    repo = AgentRepository(root=tmp_path)
    a = _agent()
    saved = repo.save(a)
    loaded = repo.get("incident-agent", "v1.0.0")
    assert saved.path == "registry/agents/incident-agent/v1.0.0.json"
    assert loaded.agent_id == a.agent_id


def test_invalid_transition_blocked(tmp_path: Path):
    repo = AgentRepository(root=tmp_path)
    svc = AgentService(repository=repo)
    repo.save(_agent(status=AgentStatus.DRAFT))
    try:
        svc.transition("incident-agent", req=AgentTransitionRequest(target_status=AgentStatus.RELEASED))
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert "Invalid lifecycle transition" in str(exc)


def test_release_requires_policy_ticket(tmp_path: Path):
    repo = AgentRepository(root=tmp_path)
    svc = AgentService(repository=repo)
    a = _agent(status=AgentStatus.VALIDATED)
    a.policy_metadata.pop("approval_ticket")
    repo.save(a)
    try:
        svc.transition("incident-agent", req=AgentTransitionRequest(target_status=AgentStatus.RELEASED))
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert "approval_ticket" in str(exc)
