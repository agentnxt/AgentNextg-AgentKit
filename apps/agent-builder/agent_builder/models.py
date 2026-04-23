from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


class AgentStatus(str, Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    RELEASED = "released"
    ARCHIVED = "archived"


ALLOWED_TRANSITIONS: dict[AgentStatus, set[AgentStatus]] = {
    AgentStatus.DRAFT: {AgentStatus.VALIDATED, AgentStatus.ARCHIVED},
    AgentStatus.VALIDATED: {AgentStatus.RELEASED, AgentStatus.ARCHIVED},
    AgentStatus.RELEASED: {AgentStatus.ARCHIVED},
    AgentStatus.ARCHIVED: set(),
}


class RuntimeConfig(BaseModel):
    framework: str = Field(min_length=2, max_length=64)
    max_iterations: int = Field(default=8, ge=1, le=200)
    timeout_seconds: int = Field(default=120, ge=5, le=3600)
    memory_enabled: bool = True
    concurrency: int = Field(default=1, ge=1, le=32)


class AgentDefinition(BaseModel):
    agent_id: str = Field(pattern=r"^[a-z0-9][a-z0-9-]{2,63}$")
    name: str = Field(min_length=3, max_length=120)
    version: str = Field(pattern=r"^v\d+\.\d+\.\d+$")
    status: AgentStatus = AgentStatus.DRAFT
    model_refs: list[str] = Field(default_factory=list)
    prompt_refs: list[str] = Field(default_factory=list)
    skill_refs: list[str] = Field(default_factory=list)
    tool_refs: list[str] = Field(default_factory=list)
    runtime_config: RuntimeConfig
    policy_metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("model_refs", "prompt_refs", "skill_refs", "tool_refs")
    @classmethod
    def _validate_refs(cls, refs: list[str]) -> list[str]:
        seen: set[str] = set()
        for ref in refs:
            if len(ref.strip()) < 2:
                raise ValueError("Reference entries must be non-empty")
            if ref in seen:
                raise ValueError("Reference entries must be unique")
            seen.add(ref)
        return refs

    @model_validator(mode="after")
    def _check_content(self) -> "AgentDefinition":
        if not self.model_refs:
            raise ValueError("At least one model reference is required")
        if not self.prompt_refs:
            raise ValueError("At least one prompt reference is required")
        return self


class AgentTransitionRequest(BaseModel):
    target_status: AgentStatus


class ValidationReport(BaseModel):
    valid: bool
    errors: list[str] = Field(default_factory=list)


class AgentListItem(BaseModel):
    agent_id: str
    name: str
    version: str
    status: AgentStatus
    updated_at: datetime


class SaveResult(BaseModel):
    path: str
    git_sha: str | None
