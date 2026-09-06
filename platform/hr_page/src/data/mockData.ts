import { AgentSpec, Candidate, ChatMessage, PipelineRun, ReviewItem, WorkflowStep } from '../types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '10:41 AM',
    content: 'I need to source a Senior Machine Learning Engineer with expertise in PyTorch and decentralized networks. Budget is $200k. Can you break down the search strategy?'
  },
  {
    id: 'msg-2',
    sender: 'agent',
    agentName: 'Planning Agent',
    timestamp: '10:42 AM',
    content: 'I have decomposed the search strategy for the Senior ML Engineer role into three actionable sub-tasks across our specialized agents.',
    tasks: [
      {
        id: 't1',
        taskNumber: 1,
        title: 'PROFILE ALIGNMENT',
        assignedAgent: 'RAG Agent',
        assignedAgentType: 'rag',
        description: 'Querying internal knowledge base against past successful hires with PyTorch/Decentralized tech stack.',
        status: 'running'
      },
      {
        id: 't2',
        taskNumber: 2,
        title: 'SOURCING EXECUTION',
        assignedAgent: 'State-Graph Agent',
        assignedAgentType: 'state-graph',
        description: 'Initiating cyclic search on external platforms filtering for target stack and $200k compensation constraints.',
        status: 'pending'
      }
    ],
    actionRequired: true
  }
];

export const INITIAL_REVIEW_ITEMS: ReviewItem[] = [
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
    description: 'Top matched candidate (Kaelen Voss - 96% Match) requires H1B transfer approval.',
    severity: 'warning',
    type: 'compliance',
    roleName: 'Senior ML Engineer',
    metadata: {
      candidateName: 'Kaelen Voss',
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

export const INITIAL_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'wf-1',
    name: 'Requirement Analysis',
    assignedTo: 'Planning Agent',
    status: 'completed',
    detail: 'Completed by Planning Agent'
  },
  {
    id: 'wf-2',
    name: 'Querying Knowledge Base',
    assignedTo: 'RAG Agent',
    status: 'in_progress',
    detail: 'RAG Agent currently scanning 12,000 internal profiles...',
    progress: 68
  },
  {
    id: 'wf-3',
    name: 'External Sourcing Loop',
    assignedTo: 'State-Graph Agent',
    status: 'pending',
    detail: 'Pending State-Graph Agent'
  }
];

export const MOCK_AGENTS: AgentSpec[] = [
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
    systemPrompt: 'Deconstruct hiring requisitions into granular sub-agents tasks, ensuring strict compliance with compensation bands and talent archetypes.',
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

export const MOCK_RUNS: PipelineRun[] = [
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

export const MOCK_CANDIDATES: Candidate[] = [
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

export const KNOWLEDGE_DOCS = [
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
