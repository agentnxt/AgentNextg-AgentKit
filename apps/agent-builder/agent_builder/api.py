from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse

from .models import AgentDefinition, AgentTransitionRequest, AgentStatus
from .service import AgentService
from .storage import AgentRepository


ROOT = Path(__file__).resolve().parents[3]
WEB_INDEX = ROOT / "apps" / "agent-builder" / "web" / "index.html"
service = AgentService(repository=AgentRepository(root=ROOT))
app = FastAPI(title="AgentBuilder API", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def home() -> HTMLResponse:
    return HTMLResponse(WEB_INDEX.read_text(encoding="utf-8"))


@app.get("/api/agents")
def list_agents():
    return service.list_agents()


@app.get("/api/agents/{agent_id}")
def get_agent(agent_id: str, version: str | None = None):
    try:
        return service.get(agent_id=agent_id, version=version)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Agent not found") from exc


@app.post("/api/agents")
def save_agent(agent: AgentDefinition):
    try:
        created, save_result = service.create_or_update(agent)
        return {"agent": created, "storage": save_result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/agents/validate")
def validate_agent(agent: AgentDefinition, target_status: AgentStatus | None = None):
    return service.validate(agent=agent, target=target_status)


@app.post("/api/agents/{agent_id}/transition")
def transition_agent(agent_id: str, req: AgentTransitionRequest):
    try:
        transitioned, save_result = service.transition(agent_id=agent_id, req=req)
        return {"agent": transitioned, "storage": save_result}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Agent not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/agents/{agent_id}/export")
def export_agent(agent_id: str, version: str | None = None):
    try:
        agent = service.get(agent_id=agent_id, version=version)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Agent not found") from exc

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("agent-definition.json", json.dumps(agent.model_dump(mode="json"), indent=2))
    buf.seek(0)
    file_name = f"{agent.agent_id}-{agent.version}.zip"
    return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={file_name}"})


@app.get("/ui", response_class=FileResponse)
def ui() -> FileResponse:
    return FileResponse(WEB_INDEX)
