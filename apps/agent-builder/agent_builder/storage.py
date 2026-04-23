from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .models import AgentDefinition, AgentListItem, SaveResult


class AgentRepository:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.registry_root = root / "registry" / "agents"
        self.registry_root.mkdir(parents=True, exist_ok=True)

    def _agent_dir(self, agent_id: str) -> Path:
        return self.registry_root / agent_id

    def save(self, agent: AgentDefinition) -> SaveResult:
        directory = self._agent_dir(agent.agent_id)
        directory.mkdir(parents=True, exist_ok=True)
        version_file = directory / f"{agent.version}.json"
        latest_file = directory / "latest.json"
        payload = agent.model_dump(mode="json")
        version_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        latest_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return SaveResult(path=str(version_file.relative_to(self.root)), git_sha=self._git_sha())

    def get(self, agent_id: str, version: str | None = None) -> AgentDefinition:
        file_name = f"{version}.json" if version else "latest.json"
        path = self._agent_dir(agent_id) / file_name
        payload = json.loads(path.read_text(encoding="utf-8"))
        return AgentDefinition.model_validate(payload)

    def list_agents(self) -> list[AgentListItem]:
        items: list[AgentListItem] = []
        for latest in sorted(self.registry_root.glob("*/latest.json")):
            payload = json.loads(latest.read_text(encoding="utf-8"))
            model = AgentDefinition.model_validate(payload)
            items.append(
                AgentListItem(
                    agent_id=model.agent_id,
                    name=model.name,
                    version=model.version,
                    status=model.status,
                    updated_at=model.updated_at,
                )
            )
        return items

    def _git_sha(self) -> str | None:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=self.root,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            return None
        return result.stdout.strip()
