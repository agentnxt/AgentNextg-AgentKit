from pathlib import Path

from fastapi.testclient import TestClient

from code_reviewer.api import app
from code_reviewer.models import (
    ModelConfiguration,
    ProviderConfiguration,
    ProviderType,
    ReviewJobRequest,
    RepositoryContext,
    RuntimeProfile,
    FileChangeContext,
)
from code_reviewer.service import CodeReviewService
from code_reviewer.storage import CodeReviewRepository


def test_provider_model_validation():
    try:
        RuntimeProfile(
            name="bad-profile",
            provider_config=ProviderConfiguration(provider=ProviderType.ANTHROPIC),
            model_selection=ModelConfiguration(model="Claude-Sonnet-4"),
        )
        assert False, "Expected model/provider mismatch"
    except ValueError as exc:
        assert "not available" in str(exc)


def test_review_job_flow(tmp_path: Path):
    repo = CodeReviewRepository(root=tmp_path)
    svc = CodeReviewService(repository=repo)
    profile = svc.create_runtime_profile(
        RuntimeProfile(
            name="anthropic-default",
            provider_config=ProviderConfiguration(provider=ProviderType.ANTHROPIC, auth_config={"api_key": "x"}),
            model_selection=ModelConfiguration(model="claude-sonnet-4-20250514"),
            is_default=True,
        )
    )

    req = ReviewJobRequest(
        repository=RepositoryContext(name="agentnxt/agentkit", branch="work", commit_sha="deadbeef"),
        file_changes=[FileChangeContext(path="a.py", change_type="modified", patch="+ password='x'\n+ print('oops')")],
        runtime_profile_id=profile.profile_id,
    )
    job = svc.submit_review(req)
    assert job.status.value == "completed"
    assert job.summary is not None
    assert len(job.findings) >= 2


def test_api_profile_creation_and_review(tmp_path: Path, monkeypatch):
    from code_reviewer import api

    api.service = CodeReviewService(CodeReviewRepository(root=tmp_path))
    client = TestClient(app)

    profile_payload = {
        "name": "ui-profile",
        "provider_config": {"provider": "anthropic", "auth_config": {"api_key": "env:ANTHROPIC_API_KEY"}},
        "model_selection": {"model": "claude-sonnet-4-20250514", "temperature": 0, "max_tokens": 4096},
        "is_default": True,
    }
    profile = client.post("/api/runtime-profiles", json=profile_payload)
    assert profile.status_code == 200
    profile_id = profile.json()["profile_id"]

    review_payload = {
        "runtime_profile_id": profile_id,
        "repository": {"name": "agentnxt/agentkit", "branch": "work", "commit_sha": "deadbeef"},
        "file_changes": [{"path": "x.py", "change_type": "modified", "patch": "+ except:\n+ pass"}],
    }
    review = client.post("/api/reviews", json=review_payload)
    assert review.status_code == 200
    assert review.json()["status"] == "completed"
