from __future__ import annotations

from datetime import datetime, timezone

from .claude_sdk import ClaudeAgentSDKReviewer
from .models import ReviewJob, ReviewJobRequest, ReviewStatus, RuntimeProfile
from .storage import CodeReviewRepository


class CodeReviewService:
    def __init__(self, repository: CodeReviewRepository, reviewer: ClaudeAgentSDKReviewer | None = None):
        self.repository = repository
        self.reviewer = reviewer or ClaudeAgentSDKReviewer()

    def create_runtime_profile(self, profile: RuntimeProfile) -> RuntimeProfile:
        if profile.is_default:
            for existing in self.repository.list_profiles():
                if existing.is_default and existing.profile_id != profile.profile_id:
                    existing.is_default = False
                    self.repository.save_profile(existing)
        return self.repository.save_profile(profile)

    def list_runtime_profiles(self) -> list[RuntimeProfile]:
        return self.repository.list_profiles()

    def submit_review(self, request: ReviewJobRequest) -> ReviewJob:
        self.repository.get_profile(request.runtime_profile_id)
        job = ReviewJob(
            repository=request.repository,
            file_changes=request.file_changes,
            runtime_profile_id=request.runtime_profile_id,
            status=ReviewStatus.RUNNING,
        )
        self.repository.save_job(job)
        try:
            findings, summary = self.reviewer.analyze(request.file_changes)
            job.findings = findings
            job.summary = summary
            job.status = ReviewStatus.COMPLETED
        except Exception as exc:  # pragma: no cover
            job.status = ReviewStatus.FAILED
            job.error = str(exc)
        job.updated_at = datetime.now(timezone.utc)
        return self.repository.save_job(job)

    def get_review(self, job_id: str) -> ReviewJob:
        return self.repository.get_job(job_id)

    def list_reviews(self) -> list[ReviewJob]:
        return self.repository.list_jobs()
