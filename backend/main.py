from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import time
from backend.services.datahub_service import DataHubService
from backend.services.ai_engine import AIEngine
from backend.services.github_service import GitHubService
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DataHub Guard AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow nextjs frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

datahub_service = DataHubService()
ai_engine = AIEngine()
github_service = GitHubService()

# In-memory store for incidents to quickly serve the frontend dashboard
# In production, this might just query DataHub incidents aspect directly
incidents_db = []

class IncidentPayload(BaseModel):
    dataset_urn: str
    error_message: str
    pipeline_id: str
    execution_timestamp: Optional[str] = None

class ChatPayload(BaseModel):
    message: str

@app.post("/api/v1/incidents/ingest")
async def ingest_incident(payload: IncidentPayload):
    print(f"Received ingest request: {payload}")
    try:
        # Create DataHub Incident
        print("Creating DataHub Incident...")
        incident_urn = datahub_service.create_incident(
            dataset_urn=payload.dataset_urn,
            message=payload.error_message,
            pipeline_id=payload.pipeline_id
        )
        print(f"Created incident: {incident_urn}")
        
        # Determine blast radius
        print("Getting lineage...")
        downstream_urns = datahub_service.get_lineage(payload.dataset_urn, direction="DOWNSTREAM")
        print(f"Got downstream urns: {downstream_urns}")
        
        # Tag downstream datasets
        if downstream_urns:
            print("Tagging downstream...")
            datahub_service.tag_downstream_impact(downstream_urns)
            
        incident = {
            "id": incident_urn.split(":")[-1],
            "urn": incident_urn,
            "dataset_urn": payload.dataset_urn,
            "error_message": payload.error_message,
            "pipeline_id": payload.pipeline_id,
            "status": "ACTIVE",
            "impacted_assets": len(downstream_urns),
            "timestamp": int(time.time()),
            "pr_url": None,
            "diagnosis": None,
            "circuit_breaker_active": False,
            "chat_history": []
        }
        incidents_db.append(incident)
        
        print("Successfully completed ingest_incident")
        return {"status": "success", "incident": incident}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/incidents")
async def get_incidents():
    return incidents_db

@app.get("/api/v1/incidents/{incident_id}")
async def get_incident(incident_id: str):
    for inc in incidents_db:
        if inc["id"] == incident_id:
            # Fetch fresh lineage for visualizer
            upstream = datahub_service.get_lineage(inc["dataset_urn"], "UPSTREAM")
            downstream = datahub_service.get_lineage(inc["dataset_urn"], "DOWNSTREAM")
            schema = datahub_service.get_dataset_schema(inc["dataset_urn"])
            return {
                **inc,
                "upstream": upstream,
                "downstream": downstream,
                "schema": schema
            }
    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/v1/incidents/{incident_id}/diagnose")
async def diagnose_incident(incident_id: str):
    for inc in incidents_db:
        if inc["id"] == incident_id:
            schema = datahub_service.get_dataset_schema(inc["dataset_urn"])
            downstream = datahub_service.get_lineage(inc["dataset_urn"], "DOWNSTREAM")
            
            # 1. AI Diagnosis
            history = datahub_service.get_historical_incidents(inc["dataset_urn"])
            diagnosis = ai_engine.diagnose_and_fix(
                error_message=inc["error_message"],
                schema=schema,
                lineage=downstream,
                historical_incidents=history
            )
            
            # 2. Open GitHub PR
            pr_url = github_service.create_pull_request(
                incident_id=incident_id,
                code_fix=diagnosis.get("code_fix", "No fix generated")
            )
            
            # 3. Write back to DataHub
            datahub_service.update_dataset_pr_link(inc["dataset_urn"], pr_url)
            
            # Update local state
            inc["diagnosis"] = diagnosis
            inc["pr_url"] = pr_url
            
            # 4. Circuit Breaker Logic
            if diagnosis.get("blast_radius_risk_score", 0) >= 8:
                inc["circuit_breaker_active"] = True
                print("CIRCUIT BREAKER TRIGGERED: Downstream pipelines paused.")
                
            # 5. Mock Slack Webhook
            print("MOCK SLACK WEBHOOK FIRED: Sent rich notification to #data-eng-alerts")
            
            return {"status": "success", "diagnosis": diagnosis, "pr_url": pr_url}
            
    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/v1/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str):
    for inc in incidents_db:
        if inc["id"] == incident_id:
            inc["status"] = "RESOLVED"
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/v1/incidents/{incident_id}/chat")
async def chat_incident(incident_id: str, payload: ChatPayload):
    for inc in incidents_db:
        if inc["id"] == incident_id:
            user_msg = payload.message
            history = inc.get("chat_history", [])
            
            # Build minimal context for AI
            context = {
                "dataset_urn": inc.get("dataset_urn"),
                "error": inc.get("error_message"),
                "risk_score": inc.get("diagnosis", {}).get("blast_radius_risk_score"),
                "pr_url": inc.get("pr_url")
            }
            
            reply = ai_engine.chat_with_incident(context, history, user_msg)
            
            history.append({"role": "user", "content": user_msg})
            history.append({"role": "assistant", "content": reply})
            inc["chat_history"] = history
            
            return {"status": "success", "reply": reply, "history": history}
            
    raise HTTPException(status_code=404, detail="Incident not found")
