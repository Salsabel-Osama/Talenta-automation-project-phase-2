import { MCPAgent, CriticalFailure, DecisionItem, RAGDocument, MCPServerConfig } from '../types';

export const INITIAL_AGENTS: MCPAgent[] = [
  {
    id: 'agent-1',
    name: 'Sourcing Agent Alpha',
    codeId: 'src-alpha-092',
    status: 'Active',
    tags: [
      { label: 'Web Search', icon: 'search' },
      { label: 'DB Write', icon: 'database' }
    ],
    serverSync: true,
    model: 'gemini-2.5-pro-orchestrator',
    clusterNode: 'node-eu-west2-a',
    latencyMs: 142,
    tokensProcessed: 1420500,
    uptime: '99.98%',
    lastExecution: 'Just now',
    description: 'Autonomous talent discovery engine searching GitHub, LinkedIn, arXiv, and developer communities.',
    systemPrompt: 'You are Talenta Sourcing Alpha. Extract qualified profiles matching target requirements and store structured candidates in PostgreSQL.'
  },
  {
    id: 'agent-2',
    name: 'Outreach Agent Beta',
    codeId: 'out-beta-144',
    status: 'Active',
    tags: [
      { label: 'Email API', icon: 'mail' }
    ],
    serverSync: true,
    model: 'gemini-2.5-flash-fast',
    clusterNode: 'node-eu-west2-b',
    latencyMs: 88,
    tokensProcessed: 890400,
    uptime: '99.95%',
    lastExecution: '12s ago',
    description: 'Hyper-personalized recruiter outreach generator adhering to tone guardrails and company culture tone.',
    systemPrompt: 'You are Outreach Beta. Generate authentic, contextual candidate communications tailored to candidate public projects.'
  },
  {
    id: 'agent-3',
    name: 'Evaluation Agent Gamma',
    codeId: 'eval-gamma-308',
    status: 'Active',
    tags: [
      { label: 'Semantic RAG', icon: 'brain' },
      { label: 'DB Write', icon: 'database' }
    ],
    serverSync: true,
    model: 'gemini-2.5-pro',
    clusterNode: 'node-eu-west2-c',
    latencyMs: 210,
    tokensProcessed: 2310000,
    uptime: '99.89%',
    lastExecution: '1m ago',
    description: 'Deep technical competency evaluator analyzing architectural depth, repositories, and technical deliverables.',
    systemPrompt: 'You are Evaluation Gamma. Perform rigorous candidate evaluation against engineering leveling matrices.'
  },
  {
    id: 'agent-4',
    name: 'Compliance Watcher Delta',
    codeId: 'comp-delta-071',
    status: 'Standby',
    tags: [
      { label: 'Policy Check', icon: 'shield' },
      { label: 'Doc Parser', icon: 'file' }
    ],
    serverSync: false,
    model: 'gemini-2.5-flash',
    clusterNode: 'node-eu-west2-d',
    latencyMs: 65,
    tokensProcessed: 450120,
    uptime: '100%',
    lastExecution: '8m ago',
    description: 'Autonomous EEO/GDPR compliance verification for automated interview transcription and bias detection.',
    systemPrompt: 'Verify anti-bias rules and data sovereignty requirements across all recruitment transcripts.'
  }
];

export const INITIAL_FAILURES: CriticalFailure[] = [
  {
    id: 'fail-1',
    runId: 'Run #8892',
    timeAgo: '2m ago',
    timestamp: '2026-08-23 20:55:12 UTC',
    title: 'API Rate Limit Exceeded',
    errorType: 'RateLimitError (429)',
    node: 'Email_Dispatch',
    graphName: 'Candidate_Outreach_Pipeline_v3',
    severity: 'critical',
    stackTrace: `RateLimitError: 429 Too Many Requests
  at SendGridAdapter.dispatchEmail (/opt/talenta/mcp/adapters/sendgrid.ts:84:15)
  at Node.executeEmailDispatch (/opt/talenta/graphs/outreach/Email_Dispatch.ts:42:28)
  at LangGraphRuntime.stepExecution (/opt/talenta/core/engine.ts:312:11)
  -- Payload: { recipient: "sarah.j@engineer.dev", template_id: "sr_eng_v2" }
  -- Quota: 120 calls/min exceeded on tenant key 'talenta-prod-outreach'`,
    inputPayload: {
      candidateId: "cand-89241",
      email: "sarah.j@engineer.dev",
      template: "sr_eng_offering_v2",
      senderProfile: "Recruitment Lead (Talenta)",
      retryCount: 3
    },
    resolved: false,
    status: 'active'
  },
  {
    id: 'fail-2',
    runId: 'Run #8890',
    timeAgo: '15m ago',
    timestamp: '2026-08-23 20:42:08 UTC',
    title: 'Graph State Deadlock',
    errorType: 'GraphDeadlockException',
    node: 'Candidate_Eval',
    graphName: 'Autonomous_Screening_Workflow',
    severity: 'critical',
    stackTrace: `GraphDeadlockException: Node 'Candidate_Eval' waited >90s for conditional edge 'peer_review_ack'
  at StateGraph.validateBarrierTransition (/opt/talenta/graphs/screening/Candidate_Eval.ts:109:9)
  at ExecutionContext.awaitBranchResolution (/opt/talenta/core/graph.ts:188:14)
  -- State Vector: { step: 4, waiting_on: ["peer_review_ack", "salary_bounds_check"], lock_id: "0x7F9B" }`,
    inputPayload: {
      candidateId: "cand-77123",
      role: "Staff Infrastructure Engineer",
      evalScore: 0.89,
      stateBarrier: "peer_review_ack"
    },
    resolved: false,
    status: 'active'
  },
  {
    id: 'fail-3',
    runId: 'Run #8886',
    timeAgo: '1h ago',
    timestamp: '2026-08-23 19:57:44 UTC',
    title: 'RAG Vector Index Anomaly',
    errorType: 'VectorSimilarityMismatch',
    node: 'Resume_Vector_Query',
    graphName: 'Semantic_Matching_Engine',
    severity: 'medium',
    stackTrace: `VectorSimilarityMismatch: Cosine distance threshold 0.75 not met for 14 chunks in Q3 Engineering Spec
  at PineconeVectorStore.queryIndex (/opt/talenta/rag/pinecone.ts:67:12)
  at Node.executeResumeVectorQuery (/opt/talenta/graphs/matching/Resume_Vector_Query.ts:28:9)`,
    inputPayload: {
      queryLength: 1024,
      collection: "tech-roles-2026",
      topK: 10
    },
    resolved: false,
    status: 'active'
  }
];

export const INITIAL_DECISIONS: DecisionItem[] = [
  {
    id: 'dec-1',
    title: 'Offer Expansion Approval',
    candidateName: 'Sarah Jenkins',
    candidateRole: 'Sr. Engineer',
    graphState: 'State: Waiting_for_Budget',
    confidence: 85,
    experienceYears: 7,
    salaryExpectation: '$195,000 / yr + 0.15% Equity',
    budgetAllocated: '$180,000 / yr',
    skills: ['Distributed Systems', 'Go', 'Kubernetes', 'PostgreSQL', 'LangGraph'],
    keyStrengths: [
      'Top 2% technical benchmark in distributed systems challenge',
      'Open-source maintainer with 4k+ GitHub stars',
      'Strong cultural score on cross-functional alignment'
    ],
    aiReasoning: 'Candidate passed all L5+ technical rounds with outstanding architectural problem solving. Recommended salary adjustment +8.3% matches current market benchmark for London/Remote tier.',
    status: 'pending',
    timestamp: '10m ago'
  },
  {
    id: 'dec-2',
    title: 'Skill Match Verification',
    candidateName: 'David Lee',
    candidateRole: 'UI Designer',
    graphState: 'Node: Sourcing_Loop',
    confidence: 60,
    experienceYears: 4,
    salaryExpectation: '$125,000 / yr',
    budgetAllocated: '$130,000 / yr',
    skills: ['Figma Design Systems', 'React / Tailwind', 'Micro-interactions', 'Design Tokens'],
    keyStrengths: [
      'High aesthetic polish on design systems documentation',
      'Experience in dark-mode enterprise tools',
      'Partial gap in user research methodologies'
    ],
    aiReasoning: 'Portfolio shows strong visual aesthetic and UI architecture, but limited formal UX research artifacts. Manual review requested before triggering interview invitation.',
    status: 'pending',
    timestamp: '24m ago'
  },
  {
    id: 'dec-3',
    title: 'Compensation Outlier Check',
    candidateName: 'Elena Rostova',
    candidateRole: 'Principal ML Engineer',
    graphState: 'State: Comp_Review_Exceed',
    confidence: 92,
    experienceYears: 11,
    salaryExpectation: '$260,000 / yr + 0.35% Equity',
    budgetAllocated: '$230,000 / yr',
    skills: ['LLM Fine-tuning', 'vLLM', 'CUDA', 'Model Distillation', 'Agentic Systems'],
    keyStrengths: [
      'Published author in NeurIPS 2025 on inference optimization',
      'Ex-Scale AI team lead with proven production scaling track record'
    ],
    aiReasoning: 'Top tier candidate with direct specialized experience in agentic workflows. Compensation band deviation of +13% justified by high role scarcity.',
    status: 'pending',
    timestamp: '42m ago'
  },
  {
    id: 'dec-4',
    title: 'Visa Sponsorship Verification',
    candidateName: 'Kenji Takahashi',
    candidateRole: 'Staff DevOps Lead',
    graphState: 'Node: Compliance_Gate',
    confidence: 74,
    experienceYears: 9,
    salaryExpectation: '€140,000 / yr',
    budgetAllocated: '€145,000 / yr',
    skills: ['Terraform', 'AWS Multi-region', 'SOC2 Compliance', 'eBPF Observability'],
    keyStrengths: [
      'Architected 99.999% uptime cluster for fintech payments',
      'Requires EU Blue Card transfer validation'
    ],
    aiReasoning: 'Candidate matches technical prerequisites. Sponsoring entity requires legal signoff on EU visa timeline before formal contract generation.',
    status: 'pending',
    timestamp: '1h ago'
  }
];

export const INITIAL_RAG_SOURCES: RAGDocument[] = [
  {
    id: 'rag-1',
    name: 'Q3_Engineering_Requirements.pdf',
    fileType: 'pdf',
    synced: 'Today, 09:00 AM',
    size: '3.4 MB',
    chunks: 142,
    embeddings: 142,
    vectorCollection: 'engineering-roles-2026',
    description: 'Technical rubrics, leveling guidelines, and system design expectations for engineering hiring.',
    status: 'synced'
  },
  {
    id: 'rag-2',
    name: 'Company_Culture_Guidelines.docx',
    fileType: 'docx',
    synced: 'Yesterday',
    size: '1.8 MB',
    chunks: 68,
    embeddings: 68,
    vectorCollection: 'culture-rubrics',
    description: 'Values, leadership principles, collaborative communication metrics, and interview question banks.',
    status: 'synced'
  },
  {
    id: 'rag-3',
    name: 'Executive_Compensation_Bands_2026.pdf',
    fileType: 'pdf',
    synced: '2 days ago',
    size: '2.1 MB',
    chunks: 95,
    embeddings: 95,
    vectorCollection: 'compensation-matrices',
    description: 'Global equity and base compensation brackets across EMEA, US, and APAC tech hubs.',
    status: 'synced'
  },
  {
    id: 'rag-4',
    name: 'Talenta_Technical_Rubric_v4.md',
    fileType: 'md',
    synced: '3 days ago',
    size: '640 KB',
    chunks: 44,
    embeddings: 44,
    vectorCollection: 'technical-evaluations',
    description: 'Live coding problem definitions, test suites, and expected complexity thresholds.',
    status: 'synced'
  }
];

export const INITIAL_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp-1',
    name: 'Talenta-Core-MCP',
    url: 'mcp://cluster.talenta.internal:8443/sse',
    protocol: 'SSE',
    status: 'connected',
    tools: ['search_github_repos', 'query_candidate_db', 'dispatch_email', 'generate_scorecard'],
    lastPing: '4ms ago',
    clusterRegion: 'eu-west2 (London)'
  },
  {
    id: 'mcp-2',
    name: 'Workday-ATS-Bridge',
    url: 'https://ats-bridge.talenta.corp/mcp/v1',
    protocol: 'Streamable HTTP',
    status: 'connected',
    tools: ['create_job_requisition', 'update_candidate_stage', 'fetch_salary_bands'],
    lastPing: '12ms ago',
    clusterRegion: 'eu-west2 (London)'
  }
];
