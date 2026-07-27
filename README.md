# DataHub Guard AI

**DataHub Guard AI** is an autonomous incident triage and lineage blast-radius engine built for the DataHub Agent Hackathon.

## Overview
This application acts as an autonomous data observability agent that receives live pipeline failures, queries the DataHub metadata catalog to analyze the blast radius across actual lineage, uses an LLM to generate code fixes, and executes bi-directional write-backs into DataHub.

## Architecture

- **Backend**: FastAPI (Python 3.12+)
  - Endpoints to ingest incidents via webhooks.
  - Integration with `acryl-datahub` SDK and GraphQL to fetch lineage, schema, and write-back tags and PR links.
  - Integration with OpenAI for root-cause diagnosis.
  - Integration with PyGithub for automated pull requests.
- **Frontend**: Next.js 14+ (App Router)
  - Interactive dashboard showing incident metrics.
  - Detailed incident view with `@xyflow/react` lineage graph rendering.
  - Side-by-side code diff view for the LLM-generated fix.

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.12+
- A running DataHub Instance (or GMS URL and Token)
- OpenAI API Key
- GitHub Personal Access Token

### 1. Backend Setup
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Copy `.env` from `backend/config.py` structure or configure environment variables in your system.

Start the backend:
```bash
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Simulating an Incident
You can ingest a simulated failure using the `examples/live_airflow_alert.json`:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/incidents/ingest \
     -H "Content-Type: application/json" \
     -d @examples/live_airflow_alert.json
```

Then visit the dashboard at `http://localhost:3000/dashboard` to see the incident and triage it using the AI diagnostic tool.
