export type NavTab = 'dashboard' | 'agents' | 'knowledge' | 'human-review' | 'failure-tickets';

export interface MCPAgent {
  id: string;
  name: string;
  codeId: string;
  status: 'Active' | 'Paused' | 'Standby' | 'Error';
  tags: { label: string; icon: 'search' | 'database' | 'mail' | 'file' | 'brain' | 'shield' }[];
  serverSync: boolean;
  model: string;
  clusterNode: string;
  latencyMs: number;
  tokensProcessed: number;
  uptime: string;
  lastExecution: string;
  description: string;
  systemPrompt: string;
}

export interface CriticalFailure {
  id: string;
  runId: string;
  timeAgo: string;
  timestamp: string;
  title: string;
  errorType: string;
  node: string;
  graphName: string;
  severity: 'critical' | 'high' | 'medium';
  stackTrace: string;
  inputPayload: Record<string, unknown>;
  resolved: boolean;
  status: 'active' | 'debugging' | 'resolved' | 'bypassed';
}

export interface DecisionItem {
  id: string;
  title: string;
  candidateName: string;
  candidateRole: string;
  graphState: string;
  confidence: number;
  experienceYears: number;
  salaryExpectation: string;
  budgetAllocated: string;
  skills: string[];
  keyStrengths: string[];
  aiReasoning: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  timestamp: string;
}

export interface RAGDocument {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'json' | 'md';
  synced: string;
  size: string;
  chunks: number;
  embeddings: number;
  vectorCollection: string;
  description: string;
  status: 'synced' | 'syncing' | 'error';
}

export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  protocol: 'SSE' | 'Streamable HTTP' | 'stdio';
  status: 'connected' | 'connecting' | 'disconnected';
  tools: string[];
  lastPing: string;
  clusterRegion: string;
}
