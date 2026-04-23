from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator


class ProviderType(str, Enum):
    ANTHROPIC = "anthropic"
    BEDROCK = "bedrock"
    VERTEX = "vertex"
    FOUNDRY = "foundry"


PROVIDER_MODEL_CATALOG: dict[ProviderType, list[str]] = {
    ProviderType.ANTHROPIC: ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
    ProviderType.BEDROCK: ["anthropic.claude-3-7-sonnet-20250219-v1:0", "anthropic.claude-3-5-haiku-20241022-v1:0"],
    ProviderType.VERTEX: ["claude-sonnet-4@20250514", "claude-opus-4@20250514"],
    ProviderType.FOUNDRY: ["Claude-Sonnet-4", "Claude-Opus-4"],
}


class ReviewStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class RecommendationType(str, Enum):
    BLOCKING_FIX = "blocking_fix"
    SHORT_TERM_FIX = "short_term_fix"
    HARDENING = "hardening"
    OBSERVABILITY = "observability"
    DOCUMENTATION = "documentation"


class RepositoryContext(BaseModel):
    name: str = Field(min_length=2)
    branch: str = Field(min_length=1)
    commit_sha: str = Field(min_length=7)
    pull_request: int | None = None


class FileChangeContext(BaseModel):
    path: str = Field(min_length=1)
    change_type: str = Field(pattern=r"^(added|modified|deleted|renamed)$")
    patch: str = Field(default="", max_length=30000)


class ProviderConfiguration(BaseModel):
    provider: ProviderType
    auth_config: dict[str, Any] = Field(default_factory=dict)


class ModelConfiguration(BaseModel):
    model: str = Field(min_length=2)
    temperature: float = Field(default=0.0, ge=0.0, le=1.0)
    max_tokens: int = Field(default=4096, ge=256, le=32768)


class RuntimeProfile(BaseModel):
    profile_id: str = Field(default_factory=lambda: f"rp-{uuid4().hex[:10]}")
    name: str = Field(min_length=3, max_length=100)
    provider_config: ProviderConfiguration
    model_selection: ModelConfiguration
    is_default: bool = False

    @model_validator(mode="after")
    def _provider_model_match(self) -> "RuntimeProfile":
        models = PROVIDER_MODEL_CATALOG.get(self.provider_config.provider, [])
        if self.model_selection.model not in models:
            raise ValueError("Model is not available for selected provider")
        return self


class Finding(BaseModel):
    finding_id: str = Field(default_factory=lambda: f"fd-{uuid4().hex[:12]}")
    title: str = Field(min_length=4)
    description: str = Field(min_length=10)
    file_path: str
    line_start: int = Field(ge=1)
    line_end: int = Field(ge=1)
    severity: Severity
    recommendation: RecommendationType


class ReviewSummary(BaseModel):
    overview: str
    risk_score: int = Field(ge=0, le=100)
    by_severity: dict[Severity, int] = Field(default_factory=dict)
    next_actions: list[str] = Field(default_factory=list)


class ReviewJobRequest(BaseModel):
    repository: RepositoryContext
    file_changes: list[FileChangeContext] = Field(min_length=1)
    runtime_profile_id: str


class ReviewJob(BaseModel):
    job_id: str = Field(default_factory=lambda: f"rv-{uuid4().hex[:12]}")
    status: ReviewStatus = ReviewStatus.QUEUED
    repository: RepositoryContext
    file_changes: list[FileChangeContext]
    runtime_profile_id: str
    findings: list[Finding] = Field(default_factory=list)
    summary: ReviewSummary | None = None
    error: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
