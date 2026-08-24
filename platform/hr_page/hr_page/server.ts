import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// In-Memory Database / State for HR Talent Platform
interface TaskCard {
  id: string;
  taskNumber: number;
  title: string;
  assignedAgent: string;
  assignedAgentType: 'rag' | 'state-graph' | 'planning' | 'code-eval';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'approved';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentName?: string;
  timestamp: string;
  content: string;
  tasks?: TaskCard[];
  actionRequired?: boolean;
  status?: string;
}

interface ReviewItem {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'alert' | 'info';
  type: 'budget' | 'compliance' | 'candidate_override' | 'outreach';
  roleName: string;
  metadata?: {
    originalValue?: string;
    suggestedValue?: string;
    marketAverage?: string;
    candidateName?: string;
  };
  status: 'pending' | 'overridden' | 'kept' | 'dismissed';
}

interface WorkflowStep {
  id: string;
  name: string;
  assignedTo: string;
  status: 'completed' | 'in_progress' | 'pending';
  detail: string;
  progress?: number;
}

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  experience: string;
  location: string;
  skills: string[];
  matchScore: number;
  expectedSalary: string;
  avatar: string;
  status: 'matched' | 'screened' | 'review_needed' | 'contacted';
  notes: string;
}

interface AgentSpec {
  id: string;
  name: string;
  role: string;
  iconType: 'planning' | 'rag' | 'state-graph' | 'screening' | 'compensation' | 'synthesis';
  status: 'active' | 'idle' | 'executing';
  autonomyLevel: 'Full Auto' | 'Human-in-the-Loop' | 'Strict Approval';
  runsCount: number;
  successRate: number;
  description: string;
  systemPrompt: string;
  currentTask?: string;
}

interface PipelineRun {
  id: string;
  roleTitle: string;
  department: string;
  targetBudget: string;
  activeAgents: string[];
  status: 'Running' | 'Awaiting Review' | 'Completed' | 'Paused';
  candidatesFound: number;
  startTime: string;
  completedSteps: number;
  totalSteps: number;
}

// In-Memory Seed Data
let agentsData: AgentSpec[] = [
  {
    id: 'agent-planning',
    name: 'Planning Agent',
    role: 'Search Orchestrator & Decomposer',
    iconType: 'planning',
    status: 'active',
    autonomyLevel: 'Human-in-the-Loop',
    runsCount: 428,
    successRate: 98.4,
    description: 'Decomposes complex talent requirements into multi-stage execution pipelines, identifying bottleneck risks and budget misalignments.',
    systemPrompt: 'Deconstruct hiring requisitions into granular sub-agent tasks, ensuring strict compliance with compensation bands and talent archetypes.',
    currentTask: 'Decomposing Senior ML Engineer Sourcing Pipeline'
  },
  {
    id: 'agent-rag',
    name: 'Memory / RAG Agent',
    role: 'Internal Knowledge Retrieval',
    iconType: 'rag',
    status: 'active',
    autonomyLevel: 'Full Auto',
    runsCount: 1240,
    successRate: 99.1,
    description: 'Semantic vector search across 12,000+ past talent profiles, hiring manager scorecards, internal interview rubrics, and salary benchmarks.',
    systemPrompt: 'Vector-query internal repository with cosine similarity >= 0.88 against target tech stacks and past top performer blueprints.',
    currentTask: 'Scanning 12,000 profiles for PyTorch & Peer-to-Peer network benchmarks'
  },
  {
    id: 'agent-state-graph',
    name: 'State-Graph Sourcing Agent',
    role: 'Cyclic Graph Crawler & Scraper',
    iconType: 'state-graph',
    status: 'executing',
    autonomyLevel: 'Human-in-the-Loop',
    runsCount: 892,
    successRate: 95.7,
    description: 'Navigates external talent hubs, GitHub repositories, Arxiv publications, and professional networks via adaptive finite-state graphs.',
    systemPrompt: 'Execute state transitions: Discover -> Verify GitHub Commits -> Validate Tech Stack -> Check Open-to-Work -> Enrich Profile.',
    currentTask: 'Evaluating GitHub commit graphs for decentralized consensus & tensor operations'
  },
  {
    id: 'agent-screening',
    name: 'Talent Screening & Fit Evaluator',
    role: 'Automated Resume & Code Screener',
    iconType: 'screening',
    status: 'active',
    autonomyLevel: 'Human-in-the-Loop',
    runsCount: 654,
    successRate: 97.2,
    description: 'Analyzes technical depth, seniority calibration, culture match metrics, and career progression velocity against role requirements.',
    systemPrompt: 'Evaluate candidate dossiers against rubric criteria, penalizing keyword stuffing and weighting real production deliverables.',
    currentTask: 'Generating technical scorecard for 8 prospective candidates'
  },
  {
    id: 'agent-compensation',
    name: 'Compensation & Market Benchmarker',
    role: 'Real-time Salary Intelligence',
    iconType: 'compensation',
    status: 'idle',
    autonomyLevel: 'Full Auto',
    runsCount: 310,
    successRate: 99.8,
    description: 'Real-time aggregate modeling of tech equity, base salary percentiles, geo-arbitrage, and competing offer dynamics across global hubs.',
    systemPrompt: 'Model compensation ranges at 25th, 50th, 75th, and 90th percentiles using live market exchange rates and tech sector index data.',
    currentTask: 'Idle - Waiting for candidate shortlist'
  }
];

let pipelineRuns: PipelineRun[] = [
  {
    id: 'RUN-2026-089',
    roleTitle: 'Senior Machine Learning Engineer',
    department: 'AI & Core Infrastructure',
    targetBudget: '$200,000 - $230,000',
    activeAgents: ['Planning Agent', 'RAG Agent', 'State-Graph Agent'],
    status: 'Running',
    candidatesFound: 14,
    startTime: 'Today, 10:41 AM',
    completedSteps: 2,
    totalSteps: 4
  },
  {
    id: 'RUN-2026-088',
    roleTitle: 'Staff Distributed Systems Architect',
    department: 'Platform Engineering',
    targetBudget: '$240,000 - $275,000',
    activeAgents: ['Planning Agent', 'State-Graph Agent', 'Screening Evaluator'],
    status: 'Awaiting Review',
    candidatesFound: 22,
    startTime: 'Yesterday, 04:15 PM',
    completedSteps: 3,
    totalSteps: 4
  },
  {
    id: 'RUN-2026-085',
    roleTitle: 'Lead Product Designer (Design Systems)',
    department: 'Product & UX',
    targetBudget: '$175,000 - $195,000',
    activeAgents: ['RAG Agent', 'Screening Evaluator'],
    status: 'Completed',
    candidatesFound: 38,
    startTime: 'Aug 21, 2026',
    completedSteps: 4,
    totalSteps: 4
  },
  {
    id: 'RUN-2026-081',
    roleTitle: 'VP of AI Research',
    department: 'Executive Search',
    targetBudget: '$380,000 - $450,000',
    activeAgents: ['Planning Agent', 'RAG Agent', 'Compensation Benchmarker'],
    status: 'Running',
    candidatesFound: 7,
    startTime: 'Aug 20, 2026',
    completedSteps: 2,
    totalSteps: 5
  }
];

let reviewItemsData: ReviewItem[] = [
  {
    id: 'rev-1',
    title: 'Budget Constraint Flag',
    description: 'Market average for requested skills is $230k. Proceed with $200k hard cap?',
    severity: 'alert',
    type: 'budget',
    roleName: 'Senior ML Engineer (PyTorch & Decentralized)',
    metadata: {
      originalValue: '$200,000',
      suggestedValue: '$230,000',
      marketAverage: '$232,500'
    },
    status: 'pending'
  },
  {
    id: 'rev-2',
    title: 'Visa Sponsorship Verification',
    description: 'Top matched candidate (Dr. Kaelen Voss - 96% Match) requires H1B transfer approval.',
    severity: 'warning',
    type: 'compliance',
    roleName: 'Senior ML Engineer',
    metadata: {
      candidateName: 'Dr. Kaelen Voss',
      suggestedValue: 'Tier-1 Sponsorship'
    },
    status: 'pending'
  },
  {
    id: 'rev-3',
    title: 'Outreach Sequence Customization',
    description: 'Generated personalized outreach targeting 14 ex-OpenAI and DeepMind alumni.',
    severity: 'info',
    type: 'outreach',
    roleName: 'Principal AI Researcher',
    status: 'pending'
  }
];

let candidatesData: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Dr. Kaelen Voss',
    title: 'Staff ML Engineer & Protocol Researcher',
    company: 'Ex-DeepMind / Bittensor Labs',
    experience: '8+ years',
    location: 'San Francisco, CA (Open to Remote)',
    skills: ['PyTorch', 'Distributed Consensus', 'CUDA', 'Libp2p', 'Transformer Architecture'],
    matchScore: 96,
    expectedSalary: '$225,000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'review_needed',
    notes: 'Top tier author on decentralized learning models. 4 patents in distributed weight sync. Budget is within override window.'
  },
  {
    id: 'cand-2',
    name: 'Elena Rostova',
    title: 'Senior Deep Learning Systems Engineer',
    company: 'Autonomous Systems Inc.',
    experience: '6 years',
    location: 'New York, NY',
    skills: ['PyTorch', 'C++', 'Ray Distributed', 'Decentralized Data Mesh', 'TensorRT'],
    matchScore: 92,
    expectedSalary: '$205,000',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'matched',
    notes: 'Built low-latency model inference pipelines across 500+ heterogeneous nodes. Highly aligned with $200k base target.'
  },
  {
    id: 'cand-3',
    name: 'Marcus Thorne',
    title: 'Lead AI Engineer',
    company: 'ConsenSys R&D',
    experience: '7 years',
    location: 'Austin, TX (Remote)',
    skills: ['PyTorch', 'Zero-Knowledge ML', 'Rust', 'EVM/Solidity', 'Python'],
    matchScore: 89,
    expectedSalary: '$210,000',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'screened',
    notes: 'Authored popular open-source zk-SNARK inference benchmark toolkit with 4.2k GitHub stars.'
  },
  {
    id: 'cand-4',
    name: 'Amina Al-Mansoor',
    title: 'Principal Research Scientist',
    company: 'Oasis Protocol Foundation',
    experience: '9 years',
    location: 'London, UK',
    skills: ['PyTorch', 'Confidential Compute', 'Federated Learning', 'Triton'],
    matchScore: 94,
    expectedSalary: '$230,000',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'review_needed',
    notes: 'Pioneer in privacy-preserving collaborative ML training over peer-to-peer gossip protocols.'
  }
];

let knowledgeDocs = [
  {
    id: 'kb-1',
    title: '2026 Engineering Leveling & Competency Matrix',
    category: 'Rubrics & Leveling',
    profilesIndexed: 'L4 to L8 Specifications',
    lastUpdated: 'Aug 15, 2026',
    summary: 'Technical depth, system design complexity, leadership scope, and impact criteria for ML & Core Infra roles.'
  },
  {
    id: 'kb-2',
    title: 'Global Tech Compensation Bands & Equity Percentiles',
    category: 'Market Intelligence',
    profilesIndexed: '4,200 data points',
    lastUpdated: 'Yesterday',
    summary: 'Live benchmark distribution across Tier 1, 2, and 3 global tech hubs for AI, Distributed Systems, and Security.'
  },
  {
    id: 'kb-3',
    title: 'Past Successful Hires & Alumni Graph (PyTorch / ML)',
    category: 'Talent Embeddings',
    profilesIndexed: '12,480 vector nodes',
    lastUpdated: '1 hour ago',
    summary: 'High-performing employee background embeddings, pedigree vectors, and retention probability indices.'
  },
  {
    id: 'kb-4',
    title: 'Standard Enterprise Outreach & Technical Screening Templates',
    category: 'Outreach & Messaging',
    profilesIndexed: '28 templates',
    lastUpdated: '3 days ago',
    summary: 'High-converting personalized email sequences tailored by seniority and open-source contribution patterns.'
  }
];

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: "production-ready",
    aiAvailable: !!process.env.GEMINI_API_KEY,
    totalAgents: agentsData.length,
    activeRuns: pipelineRuns.filter(r => r.status === 'Running').length,
  });
});

// 1. CHAT & MULTI-AGENT ORCHESTRATION ENDPOINT
app.post("/api/chat", async (req, res) => {
  try {
    const { message, mode, currentTasks } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const ai = getGenAI();
    let agentName = "Planning Agent";
    let replyContent = "";
    let generatedTasks: TaskCard[] = [];
    let matchedCandidates: Candidate[] = [...candidatesData];

    if (mode === 'state-graph') {
      agentName = "State-Graph Sourcing Agent";
    } else if (mode === 'memory-rag') {
      agentName = "Memory / RAG Agent";
    }

    if (ai) {
      try {
        const systemPrompt = `You are the ${agentName} inside the Enterprise HR Talent Intelligence Suite.
The user is requesting: "${message}" in mode "${mode || 'planning'}".
Analyze the talent requisition and provide a concise, highly strategic HR breakdown in JSON format.
Include:
1. "reply": A professional summary of how the agent handles or decomposes this search (2-3 sentences max).
2. "tasks": An array of 2 actionable subtasks with:
   - "title" (string uppercase, e.g. "GRAPH CRAWL", "VECTOR ALIGNMENT")
   - "assignedAgent" ("Planning Agent", "RAG Agent", "State-Graph Agent", or "Screening Agent")
   - "assignedAgentType" ("rag", "state-graph", "planning", or "code-eval")
   - "description" (specific strategy details, e.g. repos, rubrics, percentiles)
   - "status" ("running" or "pending")
3. "actionRequired": boolean (true if human approval is recommended)`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
          }
        });

        const text = response.text || "{}";
        const parsed = JSON.parse(text);

        replyContent = parsed.reply || `Processed requisition: "${message}". Agents are now synchronizing.`;
        if (Array.isArray(parsed.tasks)) {
          generatedTasks = parsed.tasks.map((t: any, idx: number) => ({
            id: `task-${Date.now()}-${idx + 1}`,
            taskNumber: idx + 1,
            title: t.title || `TASK ${idx + 1}`,
            assignedAgent: t.assignedAgent || 'Planning Agent',
            assignedAgentType: t.assignedAgentType || 'planning',
            description: t.description || 'Executing autonomous step',
            status: t.status || (idx === 0 ? 'running' : 'pending')
          }));
        }
      } catch (genError) {
        console.warn("Gemini generation fallback used:", genError);
      }
    }

    // Fallback if AI not configured or failed to parse
    if (!replyContent) {
      if (mode === 'state-graph') {
        replyContent = `State-Graph traversal executed across GitHub repositories and talent graphs for: "${message}". Discovered active contributors with verified code commits.`;
        generatedTasks = [
          {
            id: `task-${Date.now()}-1`,
            taskNumber: 1,
            title: 'GITHUB COMMIT GRAPH CRAWL',
            assignedAgent: 'State-Graph Agent',
            assignedAgentType: 'state-graph',
            description: 'Filtering for developers with >50 PRs in tensor computing & decentralized consensus.',
            status: 'running'
          },
          {
            id: `task-${Date.now()}-2`,
            taskNumber: 2,
            title: 'CANDIDATE DOSSIER ENRICHMENT',
            assignedAgent: 'Screening Agent',
            assignedAgentType: 'rag',
            description: 'Calibrating salary expectations and open-to-work availability.',
            status: 'pending'
          }
        ];
      } else if (mode === 'memory-rag') {
        replyContent = `Vector similarity search executed across 12,480 internal profile vectors. Found 8 high-relevance past applicants and alumni vectors matching "${message}".`;
        generatedTasks = [
          {
            id: `task-${Date.now()}-1`,
            taskNumber: 1,
            title: 'INTERNAL PROFILE VECTOR ALIGNMENT',
            assignedAgent: 'RAG Agent',
            assignedAgentType: 'rag',
            description: 'Scoring cosine similarities against past top quartile engineering hires.',
            status: 'running'
          }
        ];
      } else {
        replyContent = `I have decomposed the requisition for "${message}" into two synchronized sub-tasks across our autonomous agents.`;
        generatedTasks = [
          {
            id: `task-${Date.now()}-1`,
            taskNumber: 1,
            title: 'PROFILE & RUBRIC ALIGNMENT',
            assignedAgent: 'RAG Agent',
            assignedAgentType: 'rag',
            description: 'Aligning competency matrix and leveling criteria against market benchmarks.',
            status: 'running'
          },
          {
            id: `task-${Date.now()}-2`,
            taskNumber: 2,
            title: 'CYCLIC SOURCING EXECUTION',
            assignedAgent: 'State-Graph Agent',
            assignedAgentType: 'state-graph',
            description: 'Scanning external professional networks and research publications.',
            status: 'pending'
          }
        ];
      }
    }

    const agentMessage: ChatMessage = {
      id: `msg-agent-${Date.now()}`,
      sender: 'agent',
      agentName: agentName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: replyContent,
      tasks: generatedTasks,
      actionRequired: true
    };

    res.json({
      message: agentMessage,
      candidates: matchedCandidates
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Failed to process chat message" });
  }
});

// 2. AGENTS ENDPOINTS
app.get("/api/agents", (req, res) => {
  res.json({ agents: agentsData });
});

app.post("/api/agents", (req, res) => {
  const { name, role, autonomyLevel, description, systemPrompt } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Name and Role are required" });
  }

  const newAgent: AgentSpec = {
    id: `agent-${Date.now()}`,
    name,
    role,
    iconType: 'planning',
    status: 'active',
    autonomyLevel: autonomyLevel || 'Human-in-the-Loop',
    runsCount: 0,
    successRate: 100,
    description: description || `Autonomous agent configured for ${role.toLowerCase()}.`,
    systemPrompt: systemPrompt || 'Custom specialized talent acquisition logic.',
    currentTask: 'Initialized and standing by for pipeline assignment'
  };

  agentsData = [newAgent, ...agentsData];
  res.status(201).json({ agent: newAgent });
});

app.put("/api/agents/:id/autonomy", (req, res) => {
  const { id } = req.params;
  const { autonomyLevel } = req.body;

  const agent = agentsData.find(a => a.id === id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  agent.autonomyLevel = autonomyLevel;
  res.json({ agent });
});

app.post("/api/agents/:id/test-run", (req, res) => {
  const { id } = req.params;
  const agent = agentsData.find(a => a.id === id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  agent.runsCount += 1;
  agent.status = 'executing';
  setTimeout(() => {
    agent.status = 'active';
  }, 5000);

  res.json({
    status: "success",
    message: `Test execution initiated for agent: ${agent.name}`,
    agent,
    telemetry: {
      executionTimeMs: 340,
      nodesEvaluated: 184,
      confidenceScore: 0.96
    }
  });
});

// 3. PIPELINE RUNS ENDPOINTS
app.get("/api/runs", (req, res) => {
  res.json({ runs: pipelineRuns });
});

app.post("/api/runs", (req, res) => {
  const { roleTitle, department, targetBudget, activeAgents } = req.body;
  if (!roleTitle) {
    return res.status(400).json({ error: "Role title is required" });
  }

  const newRun: PipelineRun = {
    id: `RUN-2026-${Math.floor(100 + Math.random() * 900)}`,
    roleTitle,
    department: department || 'Engineering & AI',
    targetBudget: targetBudget || '$200k',
    activeAgents: activeAgents || ['Planning Agent', 'RAG Agent', 'State-Graph Agent'],
    status: 'Running',
    candidatesFound: Math.floor(Math.random() * 8) + 4,
    startTime: 'Just now',
    completedSteps: 1,
    totalSteps: 4
  };

  pipelineRuns = [newRun, ...pipelineRuns];
  res.status(201).json({ run: newRun });
});

// 4. CANDIDATES ENDPOINTS
app.get("/api/candidates", (req, res) => {
  const { query } = req.query;
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    const filtered = candidatesData.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );
    return res.json({ candidates: filtered });
  }
  res.json({ candidates: candidatesData });
});

// AI-Generated Outreach for Candidate
app.post("/api/candidates/:id/outreach", async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = candidatesData.find(c => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const ai = getGenAI();
    let emailSubject = `Invitation: Exploring Senior Engineering Leadership at our Team`;
    let emailBody = `Hi ${candidate.name.split(' ')[0]},\n\nI was reviewing your contributions at ${candidate.company} and your expertise in ${candidate.skills.slice(0, 3).join(', ')}. We are building cutting-edge infrastructure and would love to discuss a pivotal role with you.\n\nBest regards,\nTalent Acquisition Team`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Generate a high-converting, personalized talent outreach email for:
Candidate Name: ${candidate.name}
Role Title: ${candidate.title}
Company: ${candidate.company}
Experience: ${candidate.experience}
Top Skills: ${candidate.skills.join(', ')}
Notes: ${candidate.notes}`,
          config: {
            systemInstruction: "You are an executive HR talent scout crafting concise, authentic, and compelling recruitment outreach.",
            responseMimeType: "application/json",
            responseSchema: {
              type: "object" as any,
              properties: {
                subject: { type: "string" as any },
                body: { type: "string" as any },
                valueProposition: { type: "string" as any }
              },
              required: ["subject", "body"]
            }
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.subject) emailSubject = parsed.subject;
        if (parsed.body) emailBody = parsed.body;
      } catch (err) {
        console.warn("Outreach AI fallback used:", err);
      }
    }

    // Add to review items if not already present
    const reviewId = `rev-outreach-${Date.now()}`;
    const newReviewItem: ReviewItem = {
      id: reviewId,
      title: `Outreach Approval: ${candidate.name}`,
      description: `Personalized sequence drafted for ${candidate.title} (${candidate.matchScore}% Match).`,
      severity: 'info',
      type: 'outreach',
      roleName: candidate.title,
      metadata: {
        candidateName: candidate.name,
        suggestedValue: emailSubject
      },
      status: 'pending'
    };

    reviewItemsData = [newReviewItem, ...reviewItemsData];

    res.json({
      success: true,
      candidate,
      outreach: {
        subject: emailSubject,
        body: emailBody,
        reviewItem: newReviewItem
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate outreach" });
  }
});

// 5. HUMAN-IN-THE-LOOP REVIEW ENDPOINTS
app.get("/api/review", (req, res) => {
  res.json({ reviewItems: reviewItemsData });
});

app.post("/api/review/:id/decision", (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // 'override' | 'keep' | 'dismiss'

  const item = reviewItemsData.find(r => r.id === id);
  if (!item) {
    return res.status(404).json({ error: "Review item not found" });
  }

  if (decision === 'override') {
    item.status = 'overridden';
  } else if (decision === 'keep') {
    item.status = 'kept';
  } else if (decision === 'dismiss') {
    item.status = 'dismissed';
    reviewItemsData = reviewItemsData.filter(r => r.id !== id);
  }

  res.json({
    success: true,
    item,
    systemMessage: decision === 'override'
      ? `⚡ Human Decision Recorded: Budget constraint updated for ${item.roleName}. Sourcing filters expanded.`
      : `⚡ Human Decision Recorded: Hard cap enforced for ${item.roleName}.`
  });
});

// 6. KNOWLEDGE BASE ENDPOINTS
app.get("/api/knowledge", (req, res) => {
  const { query, category } = req.query;
  let results = [...knowledgeDocs];

  if (category && category !== 'All') {
    results = results.filter(d => d.category === category);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    results = results.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.summary.toLowerCase().includes(q)
    );
  }

  res.json({ documents: results });
});

app.post("/api/knowledge", (req, res) => {
  const { title, category, summary, profilesIndexed } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Document title is required" });
  }

  const newDoc = {
    id: `kb-${Date.now()}`,
    title,
    category: category || 'Rubrics & Leveling',
    profilesIndexed: profilesIndexed || 'Custom indexed vectors',
    lastUpdated: 'Just now',
    summary: summary || 'Custom talent assessment and leveling knowledge vector.'
  };

  knowledgeDocs = [newDoc, ...knowledgeDocs];
  res.status(201).json({ document: newDoc });
});

// 7. ANALYTICS & TELEMETRY ENDPOINT
app.get("/api/analytics", (req, res) => {
  res.json({
    kpis: [
      {
        title: 'Active Agent Runs',
        value: `${pipelineRuns.filter(r => r.status === 'Running').length + 14} Active`,
        change: '+24% this week',
        isPositive: true,
      },
      {
        title: 'Time-to-Candidate Match',
        value: '4.2 Minutes',
        change: '-78% vs manual sourcing',
        isPositive: true,
      },
      {
        title: 'Average Match Precision',
        value: '94.8%',
        change: '+6.2% RAG calibration',
        isPositive: true,
      },
      {
        title: 'Recruitment Cost Saved',
        value: '$340,000',
        change: '14 roles closed',
        isPositive: true,
      },
    ],
    funnel: [
      { stage: '1. Profiles Crawled & Scraped', count: '14,820 Candidates', percent: 100, color: '#ffb1c0' },
      { stage: '2. Vector RAG Alignment Score > 85%', count: '2,410 High Matches', percent: 74, color: '#ff809f' },
      { stage: '3. Human-in-the-Loop Approved', count: '482 Screened', percent: 45, color: '#fa1e71' },
      { stage: '4. Automated Outreach Accepted', count: '198 Interviews Scheduled', percent: 28, color: '#bd004e' },
    ],
    skillDemand: [
      { skill: 'PyTorch / Distributed AI', demand: 94, supply: 'High Deficit' },
      { skill: 'Rust Systems & Libp2p', demand: 88, supply: 'Moderate' },
      { skill: 'CUDA Kernel Optimization', demand: 92, supply: 'High Deficit' },
      { skill: 'Zero-Knowledge ML', demand: 79, supply: 'Emerging' },
    ]
  });
});

// ==========================================
// VITE MIDDLEWARE & SERVER INITIALIZATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HR Talent Intelligence Suite backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
