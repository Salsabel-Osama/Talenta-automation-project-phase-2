"""
FastAPI Backend for Enterprise HR Talent Intelligence Suite
Run with: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import time
from typing import List, Optional, Literal, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="HR Talent Intelligence Suite API",
    description="Multi-agent orchestration, talent sourcing, RAG vector alignment, and human-in-the-loop review API in FastAPI",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Pydantic Data Models
# -------------------------------------------------------------

class TaskCard(BaseModel):
    id: str
    taskNumber: int
    title: str
    assignedAgent: str
    assignedAgentType: Literal['rag', 'state-graph', 'planning', 'code-eval']
    description: str
    status: Literal['pending', 'running', 'completed', 'approved']

class ChatMessage(BaseModel):
    id: str
    sender: Literal['user', 'agent', 'system']
    agentName: Optional[str] = None
    timestamp: str
    content: str
    tasks: Optional[List[TaskCard]] = None
    actionRequired: Optional[bool] = False
    status: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    mode: Optional[Literal['state-graph', 'memory-rag', 'planning']] = 'planning'

class ReviewItemMetadata(BaseModel):
    originalValue: Optional[str] = None
    suggestedValue: Optional[str] = None
    marketAverage: Optional[str] = None
    candidateName: Optional[str] = None

class ReviewItem(BaseModel):
    id: str
    title: str
    description: str
    severity: Literal['warning', 'alert', 'info']
    type: Literal['budget', 'compliance', 'candidate_override', 'outreach']
    roleName: str
    metadata: Optional[ReviewItemMetadata] = None
    status: Literal['pending', 'overridden', 'kept', 'dismissed']

class DecisionRequest(BaseModel):
    decision: Literal['override', 'keep', 'dismiss']

class Candidate(BaseModel):
    id: str
    name: str
    title: str
    company: str
    experience: str
    location: str
    skills: List[str]
    matchScore: int
    expectedSalary: str
    avatar: str
    status: Literal['matched', 'screened', 'review_needed', 'contacted']
    notes: str

class AgentSpec(BaseModel):
    id: str
    name: str
    role: str
    iconType: Optional[str] = 'planning'
    status: Literal['active', 'idle', 'executing']
    autonomyLevel: Literal['Full Auto', 'Human-in-the-Loop', 'Strict Approval']
    runsCount: int
    successRate: float
    description: str
    systemPrompt: str
    currentTask: Optional[str] = None

class AgentCreateRequest(BaseModel):
    name: str
    role: str
    autonomyLevel: Optional[Literal['Full Auto', 'Human-in-the-Loop', 'Strict Approval']] = 'Human-in-the-Loop'
    description: Optional[str] = None
    systemPrompt: Optional[str] = None

class PipelineRun(BaseModel):
    id: str
    roleTitle: str
    department: str
    targetBudget: str
    activeAgents: List[str]
    status: Literal['Running', 'Awaiting Review', 'Completed', 'Paused']
    candidatesFound: int
    startTime: str
    completedSteps: int
    totalSteps: int

class RunCreateRequest(BaseModel):
    roleTitle: str
    department: Optional[str] = 'AI & Core Infrastructure'
    targetBudget: Optional[str] = '$200,000'
    activeAgents: Optional[List[str]] = None

class KnowledgeDoc(BaseModel):
    id: str
    title: str
    category: str
    profilesIndexed: str
    lastUpdated: str
    summary: str

class KnowledgeCreateRequest(BaseModel):
    title: str
    category: Optional[str] = 'Rubrics & Leveling'
    summary: str
    profilesIndexed: Optional[str] = 'Custom indexed vectors'

# -------------------------------------------------------------
# In-Memory Database
# -------------------------------------------------------------

AGENTS_DB: List[AgentSpec] = [
    AgentSpec(
        id='agent-planning',
        name='Planning Agent',
        role='Search Orchestrator & Decomposer',
        iconType='planning',
        status='active',
        autonomyLevel='Human-in-the-Loop',
        runsCount=428,
        successRate=98.4,
        description='Decomposes complex talent requirements into multi-stage execution pipelines, identifying bottleneck risks and budget misalignments.',
        systemPrompt='Deconstruct hiring requisitions into granular sub-agent tasks, ensuring strict compliance with compensation bands and talent archetypes.',
        currentTask='Decomposing Senior ML Engineer Sourcing Pipeline'
    ),
    AgentSpec(
        id='agent-rag',
        name='Memory / RAG Agent',
        role='Internal Knowledge Retrieval',
        iconType='rag',
        status='active',
        autonomyLevel='Full Auto',
        runsCount=1240,
        successRate=99.1,
        description='Semantic vector search across 12,000+ past talent profiles, hiring manager scorecards, internal interview rubrics, and salary benchmarks.',
        systemPrompt='Vector-query internal repository with cosine similarity >= 0.88 against target tech stacks and past top performer blueprints.',
        currentTask='Scanning 12,000 profiles for PyTorch & Peer-to-Peer network benchmarks'
    ),
    AgentSpec(
        id='agent-state-graph',
        name='State-Graph Sourcing Agent',
        role='Cyclic Graph Crawler & Scraper',
        iconType='state-graph',
        status='executing',
        autonomyLevel='Human-in-the-Loop',
        runsCount=892,
        successRate=95.7,
        description='Navigates external talent hubs, GitHub repositories, Arxiv publications, and professional networks via adaptive finite-state graphs.',
        systemPrompt='Execute state transitions: Discover -> Verify GitHub Commits -> Validate Tech Stack -> Check Open-to-Work -> Enrich Profile.',
        currentTask='Evaluating GitHub commit graphs for decentralized consensus & tensor operations'
    ),
    AgentSpec(
        id='agent-screening',
        name='Talent Screening & Fit Evaluator',
        role='Automated Resume & Code Screener',
        iconType='screening',
        status='active',
        autonomyLevel='Human-in-the-Loop',
        runsCount=654,
        successRate=97.2,
        description='Analyzes technical depth, seniority calibration, culture match metrics, and career progression velocity against role requirements.',
        systemPrompt='Evaluate candidate dossiers against rubric criteria, penalizing keyword stuffing and weighting real production deliverables.',
        currentTask='Generating technical scorecard for 8 prospective candidates'
    ),
    AgentSpec(
        id='agent-compensation',
        name='Compensation & Market Benchmarker',
        role='Real-time Salary Intelligence',
        iconType='compensation',
        status='idle',
        autonomyLevel='Full Auto',
        runsCount=310,
        successRate=99.8,
        description='Real-time aggregate modeling of tech equity, base salary percentiles, geo-arbitrage, and competing offer dynamics across global hubs.',
        systemPrompt='Model compensation ranges at 25th, 50th, 75th, and 90th percentiles using live market exchange rates and tech sector index data.',
        currentTask='Idle - Waiting for candidate shortlist'
    )
]

RUNS_DB: List[PipelineRun] = [
    PipelineRun(
        id='RUN-2026-089',
        roleTitle='Senior Machine Learning Engineer',
        department='AI & Core Infrastructure',
        targetBudget='$200,000 - $230,000',
        activeAgents=['Planning Agent', 'RAG Agent', 'State-Graph Agent'],
        status='Running',
        candidatesFound=14,
        startTime='Today, 10:41 AM',
        completedSteps=2,
        totalSteps=4
    ),
    PipelineRun(
        id='RUN-2026-088',
        roleTitle='Staff Distributed Systems Architect',
        department='Platform Engineering',
        targetBudget='$240,000 - $275,000',
        activeAgents=['Planning Agent', 'State-Graph Agent', 'Screening Evaluator'],
        status='Awaiting Review',
        candidatesFound=22,
        startTime='Yesterday, 04:15 PM',
        completedSteps=3,
        totalSteps=4
    )
]

CANDIDATES_DB: List[Candidate] = [
    Candidate(
        id='cand-1',
        name='Dr. Kaelen Voss',
        title='Staff ML Engineer & Protocol Researcher',
        company='Ex-DeepMind / Bittensor Labs',
        experience='8+ years',
        location='San Francisco, CA (Open to Remote)',
        skills=['PyTorch', 'Distributed Consensus', 'CUDA', 'Libp2p', 'Transformer Architecture'],
        matchScore=96,
        expectedSalary='$225,000',
        avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status='review_needed',
        notes='Top tier author on decentralized learning models. 4 patents in distributed weight sync. Budget is within override window.'
    ),
    Candidate(
        id='cand-2',
        name='Elena Rostova',
        title='Senior Deep Learning Systems Engineer',
        company='Autonomous Systems Inc.',
        experience='6 years',
        location='New York, NY',
        skills=['PyTorch', 'C++', 'Ray Distributed', 'Decentralized Data Mesh', 'TensorRT'],
        matchScore=92,
        expectedSalary='$205,000',
        avatar='https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        status='matched',
        notes='Built low-latency model inference pipelines across 500+ heterogeneous nodes. Highly aligned with $200k base target.'
    ),
    Candidate(
        id='cand-3',
        name='Marcus Thorne',
        title='Lead AI Engineer',
        company='ConsenSys R&D',
        experience='7 years',
        location='Austin, TX (Remote)',
        skills=['PyTorch', 'Zero-Knowledge ML', 'Rust', 'EVM/Solidity', 'Python'],
        matchScore=89,
        expectedSalary='$210,000',
        avatar='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status='screened',
        notes='Authored popular open-source zk-SNARK inference benchmark toolkit with 4.2k GitHub stars.'
    ),
    Candidate(
        id='cand-4',
        name='Amina Al-Mansoor',
        title='Principal Research Scientist',
        company='Oasis Protocol Foundation',
        experience='9 years',
        location='London, UK',
        skills=['PyTorch', 'Confidential Compute', 'Federated Learning', 'Triton'],
        matchScore=94,
        expectedSalary='$230,000',
        avatar='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status='review_needed',
        notes='Pioneer in privacy-preserving collaborative ML training over peer-to-peer gossip protocols.'
    )
]

REVIEWS_DB: List[ReviewItem] = [
    ReviewItem(
        id='rev-1',
        title='Budget Constraint Flag',
        description='Market average for requested skills is $230k. Proceed with $200k hard cap?',
        severity='alert',
        type='budget',
        roleName='Senior ML Engineer (PyTorch & Decentralized)',
        metadata=ReviewItemMetadata(
            originalValue='$200,000',
            suggestedValue='$230,000',
            marketAverage='$232,500'
        ),
        status='pending'
    ),
    ReviewItem(
        id='rev-2',
        title='Visa Sponsorship Verification',
        description='Top matched candidate (Dr. Kaelen Voss - 96% Match) requires H1B transfer approval.',
        severity='warning',
        type='compliance',
        roleName='Senior ML Engineer',
        metadata=ReviewItemMetadata(
            candidateName='Dr. Kaelen Voss',
            suggestedValue='Tier-1 Sponsorship'
        ),
        status='pending'
    )
]

KNOWLEDGE_DB: List[KnowledgeDoc] = [
    KnowledgeDoc(
        id='kb-1',
        title='2026 Engineering Leveling & Competency Matrix',
        category='Rubrics & Leveling',
        profilesIndexed='L4 to L8 Specifications',
        lastUpdated='Aug 15, 2026',
        summary='Technical depth, system design complexity, leadership scope, and impact criteria for ML & Core Infra roles.'
    ),
    KnowledgeDoc(
        id='kb-2',
        title='Global Tech Compensation Bands & Equity Percentiles',
        category='Market Intelligence',
        profilesIndexed='4,200 data points',
        lastUpdated='Yesterday',
        summary='Live benchmark distribution across Tier 1, 2, and 3 global tech hubs for AI, Distributed Systems, and Security.'
    )
]

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "framework": "FastAPI",
        "agents_count": len(AGENTS_DB),
        "runs_count": len(RUNS_DB),
        "candidates_count": len(CANDIDATES_DB)
    }

@app.post("/api/chat")
def handle_chat(req: ChatRequest):
    now_str = time.strftime("%I:%M %p")
    
    agent_name = "Planning Agent"
    if req.mode == "state-graph":
        agent_name = "State-Graph Sourcing Agent"
    elif req.mode == "memory-rag":
        agent_name = "Memory / RAG Agent"

    reply_content = f"Decomposed search strategy for '{req.message}' across autonomous HR agents."
    tasks = [
        TaskCard(
            id=f"task-{int(time.time()*1000)}-1",
            taskNumber=1,
            title="PROFILE & RUBRIC ALIGNMENT",
            assignedAgent="RAG Agent",
            assignedAgentType="rag",
            description=f"Aligning competency matrix and leveling criteria against market benchmarks for {req.message}.",
            status="running"
        ),
        TaskCard(
            id=f"task-{int(time.time()*1000)}-2",
            taskNumber=2,
            title="CYCLIC SOURCING EXECUTION",
            assignedAgent="State-Graph Agent",
            assignedAgentType="state-graph",
            description="Scanning external repositories and researcher graphs for verified code deliverables.",
            status="pending"
        )
    ]

    message = ChatMessage(
        id=f"msg-agent-{int(time.time()*1000)}",
        sender="agent",
        agentName=agent_name,
        timestamp=now_str,
        content=reply_content,
        tasks=tasks,
        actionRequired=True
    )

    return {"message": message, "candidates": CANDIDATES_DB}

@app.get("/api/agents")
def get_agents():
    return {"agents": AGENTS_DB}

@app.post("/api/agents", status_code=201)
def create_agent(req: AgentCreateRequest):
    new_agent = AgentSpec(
        id=f"agent-{int(time.time()*1000)}",
        name=req.name,
        role=req.role,
        autonomyLevel=req.autonomyLevel or 'Human-in-the-Loop',
        runsCount=0,
        successRate=100.0,
        description=req.description or f"Autonomous talent agent for {req.role}.",
        systemPrompt=req.systemPrompt or "Specialized autonomous talent logic.",
        status='active'
    )
    AGENTS_DB.insert(0, new_agent)
    return {"agent": new_agent}

@app.put("/api/agents/{agent_id}/autonomy")
def update_autonomy(agent_id: str, autonomy_level: str = Body(..., embed=True)):
    for agent in AGENTS_DB:
        if agent.id == agent_id:
            agent.autonomyLevel = autonomy_level  # type: ignore
            return {"agent": agent}
    raise HTTPException(status_code=404, detail="Agent not found")

@app.post("/api/agents/{agent_id}/test-run")
def test_run_agent(agent_id: str):
    for agent in AGENTS_DB:
        if agent.id == agent_id:
            agent.runsCount += 1
            return {
                "status": "success",
                "message": f"Test run initiated for {agent.name}",
                "telemetry": {"executionTimeMs": 310, "nodesEvaluated": 142}
            }
    raise HTTPException(status_code=404, detail="Agent not found")

@app.get("/api/runs")
def get_runs():
    return {"runs": RUNS_DB}

@app.post("/api/runs", status_code=201)
def create_run(req: RunCreateRequest):
    new_run = PipelineRun(
        id=f"RUN-2026-{int(time.time()) % 1000}",
        roleTitle=req.roleTitle,
        department=req.department or 'Engineering',
        targetBudget=req.targetBudget or '$200k',
        activeAgents=req.activeAgents or ['Planning Agent', 'State-Graph Agent'],
        status='Running',
        candidatesFound=4,
        startTime='Just now',
        completedSteps=1,
        totalSteps=4
    )
    RUNS_DB.insert(0, new_run)
    return {"run": new_run}

@app.get("/api/candidates")
def get_candidates(query: Optional[str] = None):
    if query:
        q = query.lower()
        filtered = [
            c for c in CANDIDATES_DB 
            if q in c.name.lower() or q in c.title.lower() or any(q in s.lower() for s in c.skills)
        ]
        return {"candidates": filtered}
    return {"candidates": CANDIDATES_DB}

@app.post("/api/candidates/{candidate_id}/outreach")
def generate_candidate_outreach(candidate_id: str):
    candidate = next((c for c in CANDIDATES_DB if c.id == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    subject = f"Leadership Opportunity: Exploring Key Roles at our Engineering Team"
    body = (
        f"Hi {candidate.name.split()[0]},\n\n"
        f"I came across your standout work at {candidate.company} and your deep expertise in {', '.join(candidate.skills[:3])}. "
        f"We are scaling our core systems and would love to connect for a high-level chat.\n\n"
        f"Best regards,\nTalent Acquisition"
    )

    review_item = ReviewItem(
        id=f"rev-outreach-{int(time.time()*1000)}",
        title=f"Outreach Approval: {candidate.name}",
        description=f"Personalized outreach drafted for {candidate.title}.",
        severity='info',
        type='outreach',
        roleName=candidate.title,
        status='pending'
    )
    REVIEWS_DB.insert(0, review_item)

    return {
        "success": True,
        "outreach": {
            "subject": subject,
            "body": body,
            "reviewItem": review_item
        }
    }

@app.get("/api/review")
def get_reviews():
    return {"reviewItems": REVIEWS_DB}

@app.post("/api/review/{review_id}/decision")
def review_decision(review_id: str, req: DecisionRequest):
    for r in REVIEWS_DB:
        if r.id == review_id:
            if req.decision == 'override':
                r.status = 'overridden'
            elif req.decision == 'keep':
                r.status = 'kept'
            elif req.decision == 'dismiss':
                r.status = 'dismissed'
            return {
                "success": True,
                "item": r,
                "systemMessage": f"Decision '{req.decision}' recorded successfully."
            }
    raise HTTPException(status_code=404, detail="Review item not found")

@app.get("/api/knowledge")
def get_knowledge(query: Optional[str] = None, category: Optional[str] = None):
    results = KNOWLEDGE_DB
    if category and category != 'All':
        results = [d for d in results if d.category == category]
    if query:
        q = query.lower()
        results = [d for d in results if q in d.title.lower() or q in d.summary.lower()]
    return {"documents": results}

@app.post("/api/knowledge", status_code=201)
def add_knowledge(req: KnowledgeCreateRequest):
    new_doc = KnowledgeDoc(
        id=f"kb-{int(time.time()*1000)}",
        title=req.title,
        category=req.category or 'Rubrics & Leveling',
        summary=req.summary,
        profilesIndexed=req.profilesIndexed or 'Custom vector embeddings',
        lastUpdated='Just now'
    )
    KNOWLEDGE_DB.insert(0, new_doc)
    return {"document": new_doc}
