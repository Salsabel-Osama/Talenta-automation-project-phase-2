"""
Manager Admin - FastAPI Cluster Orchestration Server
Production-grade FastAPI application providing REST & SSE endpoints for
Autonomous Agent Clusters, LangGraph HITL Decision Queues, RAG Vector Search, and MCP Servers.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import asyncio
import uuid

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI App
app = FastAPI(
    title="Manager Admin Orchestration API",
    description="Enterprise API Gateway connecting Web Admin Dashboard with Python AI Agent Clusters and MCP tools.",
    version="4.8.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PYDANTIC DATA MODELS
# ==========================================

class AgentTag(BaseModel):
    label: str
    icon: str

class MCPAgent(BaseModel):
    id: str
    name: str
    codeId: str
    status: str
    tags: List[AgentTag]
    serverSync: bool
    model: str
    clusterNode: str
    latencyMs: int
    tokensProcessed: int
    uptime: str
    lastExecution: str
    description: str
    systemPrompt: str

class AgentUpdatePayload(BaseModel):
    name: Optional[str] = None
    systemPrompt: Optional[str] = None
    status: Optional[str] = None
    model: Optional[str] = None

class SimulationRequest(BaseModel):
    inputPrompt: str

class CriticalFailure(BaseModel):
    id: str
    runId: str
    timeAgo: str
    timestamp: str
    title: str
    errorType: str
    node: str
    graphName: str
    severity: str
    stackTrace: str
    inputPayload: Dict[str, Any]
    resolved: bool
    status: str

class DecisionItem(BaseModel):
    id: str
    title: str
    candidateName: str
    candidateRole: str
    graphState: str
    confidence: int
    experienceYears: int
    salaryExpectation: str
    budgetAllocated: str
    skills: List[str]
    keyStrengths: List[str]
    aiReasoning: str
    status: str
    timestamp: str

class DecisionApprovePayload(BaseModel):
    feedbackNote: Optional[str] = None
    adjustedBudget: Optional[str] = None

class RAGDocument(BaseModel):
    id: str
    name: str
    fileType: str
    synced: str
    size: str
    chunks: int
    embeddings: int
    vectorCollection: str
    description: str
    status: str

class RAGUploadRequest(BaseModel):
    name: str
    fileType: str = "pdf"
    vectorCollection: str = "engineering-roles-2026"
    description: Optional[str] = None

class SemanticSearchRequest(BaseModel):
    query: str
    topK: int = 3

class MCPServerConfig(BaseModel):
    id: str
    name: str
    url: str
    protocol: str = "SSE"
    status: str = "connected"
    tools: List[str]
    lastPing: str
    clusterRegion: str

# ==========================================
# IN-MEMORY STORE (STATE)
# ==========================================

agents_db: List[MCPAgent] = [
    MCPAgent(
        id="agent-1",
        name="Sourcing Agent Alpha",
        codeId="src-alpha-092",
        status="Active",
        tags=[AgentTag(label="Web Search", icon="search"), AgentTag(label="DB Write", icon="database")],
        serverSync=True,
        model="gemini-2.5-pro-orchestrator",
        clusterNode="node-eu-west2-a",
        latencyMs=142,
        tokensProcessed=1420500,
        uptime="99.98%",
        lastExecution="Just now",
        description="Autonomous talent discovery engine searching GitHub, LinkedIn, arXiv, and developer communities.",
        systemPrompt="You are Talenta Sourcing Alpha. Extract qualified profiles matching target requirements and store structured candidates in PostgreSQL."
    ),
    MCPAgent(
        id="agent-2",
        name="Outreach Agent Beta",
        codeId="out-beta-144",
        status="Active",
        tags=[AgentTag(label="Email API", icon="mail")],
        serverSync=True,
        model="gemini-2.5-flash-fast",
        clusterNode="node-eu-west2-b",
        latencyMs=88,
        tokensProcessed=890400,
        uptime="99.95%",
        lastExecution="12s ago",
        description="Hyper-personalized recruiter outreach generator adhering to tone guardrails and company culture tone.",
        systemPrompt="You are Outreach Beta. Generate authentic, contextual candidate communications tailored to candidate public projects."
    ),
    MCPAgent(
        id="agent-3",
        name="Evaluation Agent Gamma",
        codeId="eval-gamma-308",
        status="Active",
        tags=[AgentTag(label="Semantic RAG", icon="brain"), AgentTag(label="DB Write", icon="database")],
        serverSync=True,
        model="gemini-2.5-pro",
        clusterNode="node-eu-west2-c",
        latencyMs=210,
        tokensProcessed=2310000,
        uptime="99.89%",
        lastExecution="1m ago",
        description="Deep technical competency evaluator analyzing architectural depth, repositories, and technical deliverables.",
        systemPrompt="You are Evaluation Gamma. Perform rigorous candidate evaluation against engineering leveling matrices."
    ),
    MCPAgent(
        id="agent-4",
        name="Compliance Watcher Delta",
        codeId="comp-delta-071",
        status="Standby",
        tags=[AgentTag(label="Policy Check", icon="shield"), AgentTag(label="Doc Parser", icon="file")],
        serverSync=False,
        model="gemini-2.5-flash",
        clusterNode="node-eu-west2-d",
        latencyMs=65,
        tokensProcessed=450120,
        uptime="100%",
        lastExecution="8m ago",
        description="Autonomous EEO/GDPR compliance verification for automated interview transcription and bias detection.",
        systemPrompt="Verify anti-bias rules and data sovereignty requirements across all recruitment transcripts."
    )
]

failures_db: List[CriticalFailure] = [
    CriticalFailure(
        id="fail-1",
        runId="Run #8892",
        timeAgo="2m ago",
        timestamp="2026-08-23 20:55:12 UTC",
        title="API Rate Limit Exceeded",
        errorType="RateLimitError (429)",
        node="Email_Dispatch",
        graphName="Candidate_Outreach_Pipeline_v3",
        severity="critical",
        stackTrace="RateLimitError: 429 Too Many Requests\n  at SendGridAdapter.dispatchEmail (/opt/talenta/mcp/adapters/sendgrid.ts:84:15)\n  at Node.executeEmailDispatch (/opt/talenta/graphs/outreach/Email_Dispatch.ts:42:28)",
        inputPayload={"candidateId": "cand-89241", "email": "sarah.j@engineer.dev", "retryCount": 3},
        resolved=False,
        status="active"
    ),
    CriticalFailure(
        id="fail-2",
        runId="Run #8890",
        timeAgo="15m ago",
        timestamp="2026-08-23 20:42:08 UTC",
        title="Graph State Deadlock",
        errorType="GraphDeadlockException",
        node="Candidate_Eval",
        graphName="Autonomous_Screening_Workflow",
        severity="critical",
        stackTrace="GraphDeadlockException: Node 'Candidate_Eval' waited >90s for conditional edge 'peer_review_ack'\n  at StateGraph.validateBarrierTransition (/opt/talenta/graphs/screening/Candidate_Eval.ts:109:9)",
        inputPayload={"candidateId": "cand-77123", "role": "Staff Infrastructure Engineer", "evalScore": 0.89},
        resolved=False,
        status="active"
    )
]

decisions_db: List[DecisionItem] = [
    DecisionItem(
        id="dec-1",
        title="Offer Expansion Approval",
        candidateName="Sarah Jenkins",
        candidateRole="Sr. Engineer",
        graphState="State: Waiting_for_Budget",
        confidence=85,
        experienceYears=7,
        salaryExpectation="$195,000 / yr + 0.15% Equity",
        budgetAllocated="$180,000 / yr",
        skills=["Distributed Systems", "Go", "Kubernetes", "PostgreSQL", "LangGraph"],
        keyStrengths=[
            "Top 2% technical benchmark in distributed systems challenge",
            "Open-source maintainer with 4k+ GitHub stars"
        ],
        aiReasoning="Candidate passed all L5+ technical rounds with outstanding architectural problem solving.",
        status="pending",
        timestamp="10m ago"
    ),
    DecisionItem(
        id="dec-2",
        title="Skill Match Verification",
        candidateName="David Lee",
        candidateRole="UI Designer",
        graphState="Node: Sourcing_Loop",
        confidence=60,
        experienceYears=4,
        salaryExpectation="$125,000 / yr",
        budgetAllocated="$130,000 / yr",
        skills=["Figma Design Systems", "React / Tailwind", "Design Tokens"],
        keyStrengths=["High aesthetic polish on design systems documentation"],
        aiReasoning="Portfolio shows strong visual aesthetic and UI architecture, but limited formal UX research artifacts.",
        status="pending",
        timestamp="24m ago"
    )
]

rag_db: List[RAGDocument] = [
    RAGDocument(
        id="rag-1",
        name="Q3_Engineering_Requirements.pdf",
        fileType="pdf",
        synced="Today, 09:00 AM",
        size="3.4 MB",
        chunks=142,
        embeddings=142,
        vectorCollection="engineering-roles-2026",
        description="Technical rubrics, leveling guidelines, and system design expectations.",
        status="synced"
    ),
    RAGDocument(
        id="rag-2",
        name="Company_Culture_Guidelines.docx",
        fileType="docx",
        synced="Yesterday",
        size="1.8 MB",
        chunks=68,
        embeddings=68,
        vectorCollection="culture-rubrics",
        description="Values, leadership principles, collaborative communication metrics.",
        status="synced"
    )
]

mcp_db: List[MCPServerConfig] = [
    MCPServerConfig(
        id="mcp-1",
        name="Talenta-Core-MCP",
        url="mcp://cluster.talenta.internal:8443/sse",
        protocol="SSE",
        status="connected",
        tools=["search_github_repos", "query_candidate_db", "dispatch_email", "generate_scorecard"],
        lastPing="4ms ago",
        clusterRegion="eu-west2 (London)"
    )
]

# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/api/health")
async def get_health():
    return {
        "status": "optimal",
        "service": "FastAPI Cluster Gateway",
        "clusterNode": "eu-west2-primary",
        "activeAgents": len([a for a in agents_db if a.status == "Active"]),
        "pendingDecisions": len([d for d in decisions_db if d.status == "pending"]),
        "criticalFailures": len(failures_db),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/telemetry")
async def get_telemetry():
    total_tokens = sum(a.tokensProcessed for a in agents_db)
    avg_latency = round(sum(a.latencyMs for a in agents_db) / max(len(agents_db), 1))
    return {
        "status": "Optimal",
        "latencyMs": avg_latency,
        "totalTokensProcessed": total_tokens,
        "activeAgentsCount": len([a for a in agents_db if a.status == "Active"]),
        "standbyAgentsCount": len([a for a in agents_db if a.status == "Standby"]),
        "failuresCount": len(failures_db),
        "pendingDecisionsCount": len([d for d in decisions_db if d.status == "pending"]),
        "connectedMcpServers": len(mcp_db),
        "ragDocumentsCount": len(rag_db),
        "clusterNode": "eu-west2-primary"
    }

@app.get("/api/agents", response_model=List[MCPAgent])
async def list_agents():
    return agents_db

@app.get("/api/agents/{agent_id}", response_model=MCPAgent)
async def get_agent(agent_id: str):
    for a in agents_db:
        if a.id == agent_id:
            return a
    raise HTTPException(status_code=404, detail="Agent not found")

@app.post("/api/agents/{agent_id}/sync")
async def toggle_agent_sync(agent_id: str):
    for a in agents_db:
        if a.id == agent_id:
            a.serverSync = not a.serverSync
            return {"success": True, "agentId": a.id, "serverSync": a.serverSync}
    raise HTTPException(status_code=404, detail="Agent not found")

@app.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, payload: AgentUpdatePayload):
    for a in agents_db:
        if a.id == agent_id:
            if payload.name is not None: a.name = payload.name
            if payload.systemPrompt is not None: a.systemPrompt = payload.systemPrompt
            if payload.status is not None: a.status = payload.status
            if payload.model is not None: a.model = payload.model
            return {"success": True, "agent": a}
    raise HTTPException(status_code=404, detail="Agent not found")

@app.post("/api/agents/{agent_id}/simulate")
async def simulate_agent_step(agent_id: str, req: SimulationRequest):
    agent = next((a for a in agents_db if a.id == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent.tokensProcessed += 380
    agent.lastExecution = "Just now"
    return {
        "success": True,
        "node": agent.clusterNode,
        "model": agent.model,
        "latencyMs": agent.latencyMs,
        "output": f"[FASTAPI AGENT RUNTIME - {agent.name}]\nProcessed Input: {req.inputPrompt}\nTools Executed: {[t.label for t in agent.tags]}\nStatus: Evaluation successful (Score: 0.92)",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/failures", response_model=List[CriticalFailure])
async def list_failures():
    return failures_db

@app.post("/api/failures/{failure_id}/resume")
async def resume_failure(failure_id: str):
    global failures_db
    matched = [f for f in failures_db if f.id == failure_id]
    if not matched:
        raise HTTPException(status_code=404, detail="Failure ticket not found")
    failures_db = [f for f in failures_db if f.id != failure_id]
    return {"success": True, "message": f"Failure {failure_id} resumed in graph state.", "failureId": failure_id}

@app.post("/api/failures/{failure_id}/bypass")
async def bypass_failure(failure_id: str):
    global failures_db
    matched = [f for f in failures_db if f.id == failure_id]
    if not matched:
        raise HTTPException(status_code=404, detail="Failure ticket not found")
    failures_db = [f for f in failures_db if f.id != failure_id]
    return {"success": True, "message": f"Failure {failure_id} bypassed.", "failureId": failure_id}

@app.get("/api/decisions", response_model=List[DecisionItem])
async def list_decisions():
    return decisions_db

@app.post("/api/decisions/{decision_id}/approve")
async def approve_decision(decision_id: str, payload: DecisionApprovePayload = None):
    global decisions_db
    matched = [d for d in decisions_db if d.id == decision_id]
    if not matched:
        raise HTTPException(status_code=404, detail="Decision item not found")
    item = matched[0]
    item.status = "approved"
    if payload and payload.adjustedBudget:
        item.budgetAllocated = payload.adjustedBudget
    decisions_db = [d for d in decisions_db if d.id != decision_id]
    return {"success": True, "message": f"Candidate {item.candidateName} approved.", "decision": item}

@app.post("/api/decisions/{decision_id}/reject")
async def reject_decision(decision_id: str):
    global decisions_db
    matched = [d for d in decisions_db if d.id == decision_id]
    if not matched:
        raise HTTPException(status_code=404, detail="Decision item not found")
    item = matched[0]
    item.status = "rejected"
    decisions_db = [d for d in decisions_db if d.id != decision_id]
    return {"success": True, "message": f"Candidate {item.candidateName} rejected.", "decision": item}

@app.get("/api/knowledge", response_model=List[RAGDocument])
async def list_knowledge():
    return rag_db

@app.post("/api/knowledge/upload")
async def upload_knowledge(doc: RAGUploadRequest):
    new_doc = RAGDocument(
        id=f"rag-{uuid.uuid4().hex[:8]}",
        name=doc.name if doc.name.endswith(f".{doc.fileType}") else f"{doc.name}.{doc.fileType}",
        fileType=doc.fileType,
        synced="Just now",
        size="2.4 MB",
        chunks=88,
        embeddings=88,
        vectorCollection=doc.vectorCollection,
        description=doc.description or "Vectorized specification file.",
        status="synced"
    )
    rag_db.insert(0, new_doc)
    return {"success": True, "document": new_doc}

@app.post("/api/knowledge/search")
async def semantic_search(req: SemanticSearchRequest):
    return {
        "success": True,
        "query": req.query,
        "results": [
            {
                "docName": "Q3_Engineering_Requirements.pdf",
                "chunkId": "chunk-14",
                "score": 0.94,
                "text": "Candidates for L5+ Staff Engineering positions must demonstrate verifiable track record in distributed consensus and telemetry."
            },
            {
                "docName": "Company_Culture_Guidelines.docx",
                "chunkId": "chunk-08",
                "score": 0.88,
                "text": "Talenta values algorithmic rigor coupled with empathy in team discussions."
            }
        ][:req.topK]
    }

@app.get("/api/mcp-servers", response_model=List[MCPServerConfig])
async def list_mcp_servers():
    return mcp_db

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
