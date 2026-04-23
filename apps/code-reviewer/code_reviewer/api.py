from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse

from .models import ReviewJobRequest, RuntimeProfile
from .service import CodeReviewService
from .storage import CodeReviewRepository


ROOT = Path(__file__).resolve().parents[3]
WEB_INDEX = ROOT / "apps" / "code-reviewer" / "web" / "index.html"
service = CodeReviewService(repository=CodeReviewRepository(root=ROOT))
app = FastAPI(title="AgentNxt CodeReviewer API", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def home() -> HTMLResponse:
    return HTMLResponse(WEB_INDEX.read_text(encoding="utf-8"))


@app.post("/api/runtime-profiles")
def create_runtime_profile(profile: RuntimeProfile):
    try:
        return service.create_runtime_profile(profile)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/runtime-profiles")
def list_runtime_profiles():
    return service.list_runtime_profiles()


@app.post("/api/reviews")
def submit_review(request: ReviewJobRequest):
    try:
        return service.submit_review(request)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Runtime profile not found: {exc}") from exc


@app.get("/api/reviews")
def list_reviews():
    return service.list_reviews()


@app.get("/api/reviews/{job_id}")
def get_review(job_id: str):
    try:
        return service.get_review(job_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Review job not found") from exc


@app.get("/ui", response_class=FileResponse)
def ui() -> FileResponse:
    return FileResponse(WEB_INDEX)
