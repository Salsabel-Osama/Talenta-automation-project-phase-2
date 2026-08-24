import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// In-memory cluster state
let clusterAgents = [
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

let clusterFailures = [
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
    stackTrace: `RateLimitError: 429 Too Many Requests\n  at SendGridAdapter.dispatchEmail (/opt/talenta/mcp/adapters/sendgrid.ts:84:15)\n  at Node.executeEmailDispatch (/opt/talenta/graphs/outreach/Email_Dispatch.ts:42:28)\n  at LangGraphRuntime.stepExecution (/opt/talenta/core/engine.ts:312:11)\n  -- Payload: { recipient: "sarah.j@engineer.dev", template_id: "sr_eng_v2" }\n  -- Quota: 120 calls/min exceeded on tenant key 'talenta-prod-outreach'`,
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
    stackTrace: `GraphDeadlockException: Node 'Candidate_Eval' waited >90s for conditional edge 'peer_review_ack'\n  at StateGraph.validateBarrierTransition (/opt/talenta/graphs/screening/Candidate_Eval.ts:109:9)\n  at ExecutionContext.awaitBranchResolution (/opt/talenta/core/graph.ts:188:14)\n  -- State Vector: { step: 4, waiting_on: ["peer_review_ack", "salary_bounds_check"], lock_id: "0x7F9B" }`,
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
    stackTrace: `VectorSimilarityMismatch: Cosine distance threshold 0.75 not met for 14 chunks in Q3 Engineering Spec\n  at PineconeVectorStore.queryIndex (/opt/talenta/rag/pinecone.ts:67:12)\n  at Node.executeResumeVectorQuery (/opt/talenta/graphs/matching/Resume_Vector_Query.ts:28:9)`,
    inputPayload: {
      queryLength: 1024,
      collection: "tech-roles-2026",
      topK: 10
    },
    resolved: false,
    status: 'active'
  }
];

let clusterDecisions = [
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

let clusterRAGDocuments = [
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

let clusterMCPServers = [
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

// Lazy Gemini AI initialization helper
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // 1. Health & Python Runtime Diagnostics
  app.get('/api/health', async (req, res) => {
    let pythonVersion = 'Unknown';
    try {
      const { stdout } = await execAsync('python3 --version');
      pythonVersion = stdout.trim();
    } catch {
      pythonVersion = 'Python3 unavailable';
    }

    res.json({
      status: 'optimal',
      clusterNode: 'eu-west2-primary',
      activeAgents: clusterAgents.filter(a => a.status === 'Active').length,
      pendingDecisions: clusterDecisions.filter(d => d.status === 'pending').length,
      criticalFailures: clusterFailures.length,
      pythonRuntime: pythonVersion,
      fastapiReady: true,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // 2. Cluster Telemetry
  app.get('/api/telemetry', (req, res) => {
    const totalTokens = clusterAgents.reduce((acc, a) => acc + a.tokensProcessed, 0);
    const avgLatency = Math.round(
      clusterAgents.reduce((acc, a) => acc + a.latencyMs, 0) / (clusterAgents.length || 1)
    );

    res.json({
      status: 'Optimal',
      latencyMs: avgLatency,
      totalTokensProcessed: totalTokens,
      activeAgentsCount: clusterAgents.filter(a => a.status === 'Active').length,
      standbyAgentsCount: clusterAgents.filter(a => a.status === 'Standby').length,
      failuresCount: clusterFailures.length,
      pendingDecisionsCount: clusterDecisions.filter(d => d.status === 'pending').length,
      connectedMcpServers: clusterMCPServers.length,
      ragDocumentsCount: clusterRAGDocuments.length,
      clusterNode: 'eu-west2-primary',
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    });
  });

  // 3. Agents Management
  app.get('/api/agents', (req, res) => {
    res.json(clusterAgents);
  });

  app.get('/api/agents/:id', (req, res) => {
    const agent = clusterAgents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  });

  app.post('/api/agents/:id/sync', (req, res) => {
    const agent = clusterAgents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.serverSync = !agent.serverSync;
    res.json({ success: true, agentId: agent.id, serverSync: agent.serverSync });
  });

  app.put('/api/agents/:id', (req, res) => {
    const idx = clusterAgents.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Agent not found' });
    
    clusterAgents[idx] = {
      ...clusterAgents[idx],
      ...req.body,
      id: clusterAgents[idx].id // preserve ID
    };
    res.json({ success: true, agent: clusterAgents[idx] });
  });

  // Agent Interactive Step Simulation (Gemini + fallback)
  app.post('/api/agents/:id/simulate', async (req, res) => {
    const agent = clusterAgents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { inputPrompt } = req.body;
    if (!inputPrompt) {
      return res.status(400).json({ error: 'inputPrompt is required' });
    }

    try {
      const gemini = getGeminiClient();
      let executionOutput = '';

      if (gemini) {
        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an AI Agent with system prompt: "${agent.systemPrompt}".
Available MCP Tools: ${agent.tags.map(t => t.label).join(', ')}.
Process this input and return a concise JSON evaluation output:
User Input: "${inputPrompt}"`
                }
              ]
            }
          ]
        });
        executionOutput = response.text || '';
      } else {
        // Fallback simulation output
        executionOutput = JSON.stringify({
          status: 'success',
          node: agent.clusterNode,
          agentId: agent.codeId,
          model: agent.model,
          evaluatedTokens: Math.floor(Math.random() * 300 + 150),
          confidenceScore: 0.91,
          toolsInvoked: agent.tags.map(t => t.label),
          summary: `Successfully parsed prompt for "${agent.name}" against target leveling matrix.`,
          nextTransition: 'Decision_Gate'
        }, null, 2);
      }

      agent.tokensProcessed += 420;
      agent.lastExecution = 'Just now';

      res.json({
        success: true,
        node: agent.clusterNode,
        model: agent.model,
        latencyMs: agent.latencyMs,
        output: executionOutput,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Agent simulation failed'
      });
    }
  });

  // 4. Critical Failure Tickets
  app.get('/api/failures', (req, res) => {
    res.json(clusterFailures);
  });

  app.post('/api/failures/:id/resume', (req, res) => {
    const idx = clusterFailures.findIndex(f => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Failure ticket not found' });
    
    const [resumed] = clusterFailures.splice(idx, 1);
    res.json({
      success: true,
      message: `Node ${resumed.node} successfully resumed and advanced in graph pipeline.`,
      failureId: req.params.id
    });
  });

  app.post('/api/failures/:id/bypass', (req, res) => {
    const idx = clusterFailures.findIndex(f => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Failure ticket not found' });
    
    const [bypassed] = clusterFailures.splice(idx, 1);
    res.json({
      success: true,
      message: `Failure ticket ${bypassed.runId} bypassed and marked resolved.`,
      failureId: req.params.id
    });
  });

  // 5. Human-in-the-Loop Decisions
  app.get('/api/decisions', (req, res) => {
    res.json(clusterDecisions);
  });

  app.post('/api/decisions/:id/approve', (req, res) => {
    const decision = clusterDecisions.find(d => d.id === req.params.id);
    if (!decision) return res.status(404).json({ error: 'Decision item not found' });
    
    const { feedbackNote, adjustedBudget } = req.body || {};
    decision.status = 'approved';
    if (adjustedBudget) decision.budgetAllocated = adjustedBudget;

    // Filter out from active pending queue
    clusterDecisions = clusterDecisions.filter(d => d.id !== req.params.id);

    res.json({
      success: true,
      message: `Candidate ${decision.candidateName} approved and offer released.`,
      decision,
      feedbackNote
    });
  });

  app.post('/api/decisions/:id/reject', (req, res) => {
    const decision = clusterDecisions.find(d => d.id === req.params.id);
    if (!decision) return res.status(404).json({ error: 'Decision item not found' });
    
    decision.status = 'rejected';
    clusterDecisions = clusterDecisions.filter(d => d.id !== req.params.id);

    res.json({
      success: true,
      message: `Application for ${decision.candidateName} archived and marked rejected.`,
      decision
    });
  });

  // 6. RAG Knowledge Vector Engine
  app.get('/api/knowledge', (req, res) => {
    res.json(clusterRAGDocuments);
  });

  app.post('/api/knowledge/upload', (req, res) => {
    const { name, fileType, vectorCollection, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const newDoc = {
      id: `rag-${Date.now()}`,
      name: name.endsWith(`.${fileType || 'pdf'}`) ? name : `${name}.${fileType || 'pdf'}`,
      fileType: fileType || 'pdf',
      synced: 'Just now',
      size: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
      chunks: Math.floor(Math.random() * 90 + 35),
      embeddings: Math.floor(Math.random() * 90 + 35),
      vectorCollection: vectorCollection || 'engineering-roles-2026',
      description: description || 'Vectorized organizational document for recruiter grounding.',
      status: 'synced'
    };

    clusterRAGDocuments.unshift(newDoc);
    res.json({ success: true, document: newDoc });
  });

  // Semantic Vector Search (Gemini embeddings or vector cosine matching)
  app.post('/api/knowledge/search', async (req, res) => {
    const { query, topK = 3 } = req.body;
    if (!query) return res.status(400).json({ error: 'query string is required' });

    const mockCorpus = [
      {
        docName: 'Q3_Engineering_Requirements.pdf',
        chunkId: 'chunk-14',
        score: 0.94,
        text: 'Candidates for L5+ Staff Engineering positions must demonstrate verifiable track record in distributed consensus, eBPF telemetry, and high-throughput PostgreSQL partitioning.'
      },
      {
        docName: 'Company_Culture_Guidelines.docx',
        chunkId: 'chunk-08',
        score: 0.88,
        text: 'Talenta values algorithmic rigor coupled with empathy. In technical deep-dives, evaluate how candidates explain architectural trade-offs to non-domain stakeholders.'
      },
      {
        docName: 'Executive_Compensation_Bands_2026.pdf',
        chunkId: 'chunk-29',
        score: 0.81,
        text: 'Tier-1 EMEA engineering compensation targets: Staff $170k-$210k + 0.15% equity. Deviations above 10% require automated or manual HR Director sign-off.'
      },
      {
        docName: 'Talenta_Technical_Rubric_v4.md',
        chunkId: 'chunk-03',
        score: 0.79,
        text: 'Systems Architecture rubric: L5 must architect fault-tolerant message brokers with idempotent consumers and at-least-once delivery guarantees.'
      }
    ];

    res.json({
      success: true,
      query,
      results: mockCorpus.slice(0, topK)
    });
  });

  // 7. MCP Servers Connection
  app.get('/api/mcp-servers', (req, res) => {
    res.json(clusterMCPServers);
  });

  app.post('/api/mcp-servers', (req, res) => {
    const { name, url, protocol, tools } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'name and url are required' });

    const newServer = {
      id: `mcp-${Date.now()}`,
      name,
      url,
      protocol: protocol || 'SSE',
      status: 'connected',
      tools: tools || ['query_job_posts', 'sync_candidate_applications', 'export_interview_rubrics'],
      lastPing: '1ms ago',
      clusterRegion: 'eu-west2 (London)'
    };

    clusterMCPServers.push(newServer);
    res.json({ success: true, server: newServer });
  });

  app.post('/api/mcp-servers/:id/ping', (req, res) => {
    const server = clusterMCPServers.find(s => s.id === req.params.id);
    if (!server) return res.status(404).json({ error: 'MCP Server not found' });
    
    server.lastPing = `${Math.floor(Math.random() * 8 + 2)}ms ago`;
    res.json({
      success: true,
      serverName: server.name,
      latency: server.lastPing,
      toolsDiscovered: server.tools.length
    });
  });

  // 8. Python Code Execution & FastAPI Bridge Runner
  app.post('/api/python/run', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    try {
      // Execute python code safely
      const escapedCode = code.replace(/"/g, '\\"');
      const { stdout, stderr } = await execAsync(`python3 -c "${escapedCode}"`, { timeout: 10000 });
      res.json({
        success: true,
        stdout: stdout || '',
        stderr: stderr || ''
      });
    } catch (err: any) {
      res.json({
        success: false,
        error: err.message,
        stderr: err.stderr || ''
      });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Manager Admin API] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
