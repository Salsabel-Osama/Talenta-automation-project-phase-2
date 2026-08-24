import { MCPAgent, CriticalFailure, DecisionItem, RAGDocument, MCPServerConfig } from '../types';

const API_BASE = '/api';

export interface HealthStatus {
  status: string;
  clusterNode: string;
  activeAgents: number;
  pendingDecisions: number;
  criticalFailures: number;
  pythonRuntime?: string;
  fastapiReady?: boolean;
  uptimeSeconds?: number;
  timestamp: string;
}

export interface TelemetryData {
  status: string;
  latencyMs: number;
  totalTokensProcessed: number;
  activeAgentsCount: number;
  standbyAgentsCount: number;
  failuresCount: number;
  pendingDecisionsCount: number;
  connectedMcpServers: number;
  ragDocumentsCount: number;
  clusterNode: string;
  memoryUsageMb: number;
}

export const apiClient = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getTelemetry(): Promise<TelemetryData> {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return res.json();
  },

  async getAgents(): Promise<MCPAgent[]> {
    const res = await fetch(`${API_BASE}/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async toggleAgentSync(agentId: string): Promise<{ success: boolean; serverSync: boolean }> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle agent sync');
    return res.json();
  },

  async updateAgent(agentId: string, payload: Partial<MCPAgent>): Promise<{ success: boolean; agent: MCPAgent }> {
    const res = await fetch(`${API_BASE}/agents/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update agent');
    return res.json();
  },

  async simulateAgent(agentId: string, inputPrompt: string): Promise<{
    success: boolean;
    node: string;
    model: string;
    latencyMs: number;
    output: string;
  }> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputPrompt })
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  async getFailures(): Promise<CriticalFailure[]> {
    const res = await fetch(`${API_BASE}/failures`);
    if (!res.ok) throw new Error('Failed to fetch failures');
    return res.json();
  },

  async resumeFailure(failureId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/failures/${failureId}/resume`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resume failure');
    return res.json();
  },

  async bypassFailure(failureId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/failures/${failureId}/bypass`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to bypass failure');
    return res.json();
  },

  async getDecisions(): Promise<DecisionItem[]> {
    const res = await fetch(`${API_BASE}/decisions`);
    if (!res.ok) throw new Error('Failed to fetch decisions');
    return res.json();
  },

  async approveDecision(decisionId: string, feedbackNote?: string, adjustedBudget?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/decisions/${decisionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackNote, adjustedBudget })
    });
    if (!res.ok) throw new Error('Failed to approve decision');
    return res.json();
  },

  async rejectDecision(decisionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/decisions/${decisionId}/reject`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reject decision');
    return res.json();
  },

  async getKnowledge(): Promise<RAGDocument[]> {
    const res = await fetch(`${API_BASE}/knowledge`);
    if (!res.ok) throw new Error('Failed to fetch knowledge sources');
    return res.json();
  },

  async uploadKnowledgeDoc(data: {
    name: string;
    fileType: string;
    vectorCollection: string;
    description: string;
  }): Promise<{ success: boolean; document: RAGDocument }> {
    const res = await fetch(`${API_BASE}/knowledge/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async searchKnowledge(query: string, topK = 3): Promise<{
    success: boolean;
    query: string;
    results: { docName: string; chunkId: string; score: number; text: string }[];
  }> {
    const res = await fetch(`${API_BASE}/knowledge/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK })
    });
    if (!res.ok) throw new Error('Semantic search failed');
    return res.json();
  },

  async getMCPServers(): Promise<MCPServerConfig[]> {
    const res = await fetch(`${API_BASE}/mcp-servers`);
    if (!res.ok) throw new Error('Failed to fetch MCP servers');
    return res.json();
  },

  async connectMCPServer(data: {
    name: string;
    url: string;
    protocol: string;
    tools?: string[];
  }): Promise<{ success: boolean; server: MCPServerConfig }> {
    const res = await fetch(`${API_BASE}/mcp-servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to connect MCP server');
    return res.json();
  },

  async pingMCPServer(id: string): Promise<{ success: boolean; latency: string; toolsDiscovered: number }> {
    const res = await fetch(`${API_BASE}/mcp-servers/${id}/ping`, { method: 'POST' });
    if (!res.ok) throw new Error('Ping failed');
    return res.json();
  },

  async runPython(code: string): Promise<{ success: boolean; stdout: string; stderr: string; error?: string }> {
    const res = await fetch(`${API_BASE}/python/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Python execution request failed');
    return res.json();
  }
};
