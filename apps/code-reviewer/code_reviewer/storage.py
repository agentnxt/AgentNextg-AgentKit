from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from .models import ReviewJob, RuntimeProfile


class CodeReviewRepository:
    def __init__(self, root: Path):
        self.root = root
        self.jobs_dir = root / "registry" / "code-reviewer" / "jobs"
        self.profiles_dir = root / "registry" / "code-reviewer" / "runtime-profiles"
        self.jobs_dir.mkdir(parents=True, exist_ok=True)
        self.profiles_dir.mkdir(parents=True, exist_ok=True)

    def save_profile(self, profile: RuntimeProfile) -> RuntimeProfile:
        out = self.profiles_dir / f"{profile.profile_id}.json"
        out.write_text(json.dumps(profile.model_dump(mode="json"), indent=2), encoding="utf-8")
        return profile

    def list_profiles(self) -> list[RuntimeProfile]:
        return [RuntimeProfile.model_validate_json(p.read_text(encoding="utf-8")) for p in sorted(self.profiles_dir.glob("*.json"))]

    def get_profile(self, profile_id: str) -> RuntimeProfile:
        p = self.profiles_dir / f"{profile_id}.json"
        if not p.exists():
            raise FileNotFoundError(profile_id)
        return RuntimeProfile.model_validate_json(p.read_text(encoding="utf-8"))

    def save_job(self, job: ReviewJob) -> ReviewJob:
        job.updated_at = datetime.now(timezone.utc)
        out = self.jobs_dir / f"{job.job_id}.json"
        out.write_text(json.dumps(job.model_dump(mode="json"), indent=2), encoding="utf-8")
        return job

    def get_job(self, job_id: str) -> ReviewJob:
        p = self.jobs_dir / f"{job_id}.json"
        if not p.exists():
            raise FileNotFoundError(job_id)
        return ReviewJob.model_validate_json(p.read_text(encoding="utf-8"))

    def list_jobs(self) -> list[ReviewJob]:
        jobs = [ReviewJob.model_validate_json(p.read_text(encoding="utf-8")) for p in sorted(self.jobs_dir.glob("*.json"))]
        return sorted(jobs, key=lambda x: x.updated_at, reverse=True)
