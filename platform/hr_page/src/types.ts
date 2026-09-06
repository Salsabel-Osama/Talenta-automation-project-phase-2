export type NavigationTab = 'chat' | 'agents' | 'runs' | 'review' | 'knowledge' | 'dashboard' | 'analytics';

export type AgentMode = 'state-graph' | 'memory-rag' | 'planning';

export interface TaskCard {
  id: string;
  taskNumber: number;
  title: string;
  assignedAgent: string;
  assignedAgentType: 'rag' | 'state-graph' | 'planning' | 'code-eval';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'approved';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentName?: string;
  timestamp: string;
  content: string;
  tasks?: TaskCard[];
  actionRequired?: boolean;
  status?: string;
}

export interface ReviewItem {
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

export interface WorkflowStep {
  id: string;
  name: string;
  assignedTo: string;
  status: 'completed' | 'in_progress' | 'pending';
  detail: string;
  progress?: number;
}

export interface Candidate {
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

export interface AgentSpec {
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

export interface PipelineRun {
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
