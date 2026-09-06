import { Candidate } from '../types';

export interface ExtendedCandidate extends Candidate {
  email: string;
  phone: string;
  github: string;
  architectureScore: number;
  velocityScore: number;
  communicationScore: number;
  keyProjects: string[];
  suggestedQuestions: string[];
  managerNotes?: string;
  decisionStatus?: 'pending' | 'approved' | 'rejected' | 'interview_scheduled';
}

export const INITIAL_CANDIDATES: ExtendedCandidate[] = [
  {
    id: 'cand-1',
    name: 'Sarah Lin',
    role: 'Lead Full-Stack AI Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    email: 'sarah.lin@talent-vector.dev',
    phone: '+1 (415) 890-3412',
    github: 'github.com/sarahlin-dev',
    matchScore: 98.4,
    skills: ['React 19', 'TypeScript', 'Vector DBs', 'Python', 'LLM Orchestration', 'FastAPI'],
    velocity: 'Top 1% (Tier 1)',
    experienceYears: 7,
    location: 'San Francisco, CA (Hybrid / Remote)',
    aiSummary: 'Authored high-throughput RAG search pipelines. Exceptional code modularity and clean architectural abstractions across 40+ production PRs.',
    architectureScore: 96,
    velocityScore: 98,
    communicationScore: 94,
    keyProjects: ['Distributed Vector Retrieval Engine', 'Real-time Canvas WebApp', 'Multi-agent Task Router'],
    suggestedQuestions: [
      'How do you manage latency budgets when chaining multiple LLM inference calls?',
      'Walk us through the schema migration strategies for high-frequency vector indexing.',
    ],
    status: 'recommended',
    decisionStatus: 'pending',
  },
  {
    id: 'cand-2',
    name: 'Marcus Vance',
    role: 'Staff Distributed Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    email: 'marcus.vance@core-systems.io',
    phone: '+1 (206) 555-7821',
    github: 'github.com/mvance-distributed',
    matchScore: 95.8,
    skills: ['Go', 'Kubernetes', 'Rust', 'Kafka', 'PostgreSQL', 'eBPF'],
    velocity: 'Top 3% (Tier 1)',
    experienceYears: 10,
    location: 'Seattle, WA (Remote)',
    aiSummary: 'Former principal architect for financial transaction clearing. Deep experience with Raft consensus and zero-downtime database sharding.',
    architectureScore: 99,
    velocityScore: 92,
    communicationScore: 91,
    keyProjects: ['Zero-Allocation Raft Protocol', 'Global Event Sourcing Broker', 'eBPF Network Telemetry'],
    suggestedQuestions: [
      'How do you debug split-brain scenarios in quorum-based distributed state machines?',
      'What trade-offs do you consider between strong consistency and write latency under cross-region replication?',
    ],
    status: 'shortlisted',
    decisionStatus: 'approved',
  },
  {
    id: 'cand-3',
    name: 'Elena Rostova',
    role: 'Senior Machine Learning Platform Engineer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    email: 'elena.rostova@mlops-ai.org',
    phone: '+44 20 7946 0912',
    github: 'github.com/erostova-ml',
    matchScore: 94.2,
    skills: ['PyTorch', 'Kubeflow', 'Triton Server', 'CUDA', 'Python', 'MLflow'],
    velocity: 'Top 5% (Tier 1)',
    experienceYears: 6,
    location: 'London, UK (Hybrid)',
    aiSummary: 'Designed automated GPU inference batching reducing cloud costs by 42%. Proven track record of deploying continuous fine-tuning pipelines.',
    architectureScore: 93,
    velocityScore: 96,
    communicationScore: 90,
    keyProjects: ['Triton Dynamic Batching Optimizer', 'Serverless GPU Autoscaler', 'Model Registry CI/CD'],
    suggestedQuestions: [
      'How do you prevent quantization drift when converting models to TensorRT/ONNX?',
      'Describe your strategy for canary model deployments with real-time feedback loops.',
    ],
    status: 'in_review',
    decisionStatus: 'pending',
  },
  {
    id: 'cand-4',
    name: 'Devon Takahashi',
    role: 'Principal Frontend Infrastructure Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    email: 'devon.takahashi@webcore.dev',
    phone: '+1 (512) 441-9923',
    github: 'github.com/dtakahashi-ui',
    matchScore: 92.5,
    skills: ['TypeScript', 'Vite', 'Design Systems', 'Micro-Frontends', 'WebAssembly', 'Performance'],
    velocity: 'Top 5% (Tier 1)',
    experienceYears: 8,
    location: 'Austin, TX (Remote)',
    aiSummary: 'Author of widely adopted open-source compilation plugins. Maintained 99.9th percentile Core Web Vitals across millions of daily active users.',
    architectureScore: 91,
    velocityScore: 94,
    communicationScore: 96,
    keyProjects: ['Universal Design Token Compiler', 'WASM Bytecode Image Decoder', 'Micro-Frontend Federation Hub'],
    suggestedQuestions: [
      'How do you balance bundle size constraints with rich client-side interactivity?',
      'What is your methodology for automated visual regression testing at scale?',
    ],
    status: 'shortlisted',
    decisionStatus: 'interview_scheduled',
  },
];
