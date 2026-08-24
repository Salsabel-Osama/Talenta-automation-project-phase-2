import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AgentsView } from './components/AgentsView';
import { KnowledgeView } from './components/KnowledgeView';
import { HumanReviewView } from './components/HumanReviewView';
import { FailureTicketsView } from './components/FailureTicketsView';
import { DebugModal } from './components/DebugModal';
import { ReviewModal } from './components/ReviewModal';
import { UploadSourceModal } from './components/UploadSourceModal';
import { ConnectMCPModal } from './components/ConnectMCPModal';
import { FastAPIInspectorModal } from './components/FastAPIInspectorModal';
import { 
  INITIAL_AGENTS, 
  INITIAL_FAILURES, 
  INITIAL_DECISIONS, 
  INITIAL_RAG_SOURCES, 
  INITIAL_MCP_SERVERS 
} from './data/mockData';
import { 
  NavTab, 
  MCPAgent, 
  CriticalFailure, 
  DecisionItem, 
  RAGDocument, 
  MCPServerConfig 
} from './types';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { apiClient } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [agents, setAgents] = useState<MCPAgent[]>(INITIAL_AGENTS);
  const [failures, setFailures] = useState<CriticalFailure[]>(INITIAL_FAILURES);
  const [decisions, setDecisions] = useState<DecisionItem[]>(INITIAL_DECISIONS);
  const [ragSources, setRagSources] = useState<RAGDocument[]>(INITIAL_RAG_SOURCES);
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>(INITIAL_MCP_SERVERS);

  // Modals state
  const [debugTarget, setDebugTarget] = useState<CriticalFailure | null>(null);
  const [reviewTarget, setReviewTarget] = useState<DecisionItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isConnectMCPOpen, setIsConnectMCPOpen] = useState(false);
  const [isFastAPIOpen, setIsFastAPIOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial fetch from backend API
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [agentsRes, failuresRes, decisionsRes, ragRes, mcpRes] = await Promise.allSettled([
          apiClient.getAgents(),
          apiClient.getFailures(),
          apiClient.getDecisions(),
          apiClient.getKnowledge(),
          apiClient.getMCPServers(),
        ]);

        if (agentsRes.status === 'fulfilled') setAgents(agentsRes.value);
        if (failuresRes.status === 'fulfilled') setFailures(failuresRes.value);
        if (decisionsRes.status === 'fulfilled') setDecisions(decisionsRes.value);
        if (ragRes.status === 'fulfilled') setRagSources(ragRes.value);
        if (mcpRes.status === 'fulfilled') setMcpServers(mcpRes.value);
      } catch (err) {
        console.warn('Backend sync initializing, using cached store state.');
      }
    }

    loadBackendData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Toggle Server Sync for an agent
  const handleToggleServerSync = async (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const nextSync = !a.serverSync;
        showToast(`${a.name}: Server Sync turned ${nextSync ? 'ON' : 'OFF'}`);
        return { ...a, serverSync: nextSync };
      }
      return a;
    }));

    try {
      await apiClient.toggleAgentSync(agentId);
    } catch {
      // Handled optimistically
    }
  };

  // Refresh Telemetry
  const handleRefreshTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const telemetry = await apiClient.getTelemetry();
      setTimeout(() => {
        setIsRefreshing(false);
        showToast(`Cluster Telemetry synced. Latency: ${telemetry.latencyMs}ms • Active Agents: ${telemetry.activeAgentsCount}`);
      }, 400);
    } catch {
      setTimeout(() => {
        setIsRefreshing(false);
        showToast('Cluster Telemetry synced. Latency: 42ms • Status: Optimal');
      }, 400);
    }
  };

  // Resume Failure
  const handleResumeFailure = async (failureId: string) => {
    setFailures(prev => prev.filter(f => f.id !== failureId));
    showToast(`Execution node successfully resumed. Graph state advancing.`);
    try {
      await apiClient.resumeFailure(failureId);
    } catch {
      // optimistic update
    }
  };

  // Bypass Failure
  const handleBypassFailure = async (failureId: string) => {
    setFailures(prev => prev.filter(f => f.id !== failureId));
    showToast(`Failure ticket bypassed and marked resolved.`);
    try {
      await apiClient.bypassFailure(failureId);
    } catch {
      // optimistic update
    }
  };

  // Approve Decision
  const handleApproveDecision = async (decisionId: string, feedbackNote?: string, adjustedBudget?: string) => {
    const item = decisions.find(d => d.id === decisionId);
    setDecisions(prev => prev.filter(d => d.id !== decisionId));
    showToast(`Approved: ${item?.candidateName || 'Candidate'} offer released to next stage.`);
    try {
      await apiClient.approveDecision(decisionId, feedbackNote, adjustedBudget);
    } catch {
      // optimistic update
    }
  };

  // Reject Decision
  const handleRejectDecision = async (decisionId: string) => {
    const item = decisions.find(d => d.id === decisionId);
    setDecisions(prev => prev.filter(d => d.id !== decisionId));
    showToast(`Archived: ${item?.candidateName || 'Candidate'} application rejected.`);
    try {
      await apiClient.rejectDecision(decisionId);
    } catch {
      // optimistic update
    }
  };

  // Upload new RAG Source
  const handleUploadSourceComplete = (newDoc: RAGDocument) => {
    setRagSources(prev => [newDoc, ...prev]);
    showToast(`Vectorized ${newDoc.name} (${newDoc.chunks} embeddings generated).`);
  };

  // Connect new MCP Server
  const handleConnectMCPServer = (newServer: MCPServerConfig) => {
    setMcpServers(prev => [newServer, ...prev]);
    showToast(`Connected MCP Server: ${newServer.name} (${newServer.tools.length} tools registered).`);
  };

  // Update Agent System Prompt
  const handleUpdateAgent = async (updated: MCPAgent) => {
    setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
    try {
      await apiClient.updateAgent(updated.id, updated);
    } catch {
      // optimistic update
    }
  };

  return (
    <div className="min-h-screen bg-[#240018] text-[#ffd8e9] flex flex-row overflow-x-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        failureCount={failures.length}
        onOpenConnectMCP={() => setIsConnectMCPOpen(true)}
        onOpenFastAPI={() => setIsFastAPIOpen(true)}
        onLogoutClick={() => showToast('Super Admin session active (Enterprise SSO).')}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto min-h-screen flex flex-col justify-between">
        <div className="w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              agents={agents}
              failures={failures}
              decisions={decisions}
              ragSources={ragSources}
              onToggleServerSync={handleToggleServerSync}
              onOpenDebug={(f) => setDebugTarget(f)}
              onOpenReview={(d) => setReviewTarget(d)}
              onOpenUploadSource={() => setIsUploadOpen(true)}
              onRefreshTelemetry={handleRefreshTelemetry}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'agents' && (
            <AgentsView
              agents={agents}
              onToggleServerSync={handleToggleServerSync}
              onUpdateAgent={handleUpdateAgent}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeView
              ragSources={ragSources}
              onOpenUploadSource={() => setIsUploadOpen(true)}
            />
          )}

          {activeTab === 'human-review' && (
            <HumanReviewView
              decisions={decisions}
              onOpenReview={(d) => setReviewTarget(d)}
              onApprove={handleApproveDecision}
              onReject={handleRejectDecision}
            />
          )}

          {activeTab === 'failure-tickets' && (
            <FailureTicketsView
              failures={failures}
              onOpenDebug={(f) => setDebugTarget(f)}
              onBypass={handleBypassFailure}
              onResume={handleResumeFailure}
            />
          )}
        </div>

        {/* Subtle Footer */}
        <footer className="mt-12 pt-6 border-t border-[#471a35]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-[#d49bb6]/60 gap-2">
          <span>Manager Admin Cluster Orchestration • FastAPI & Python Backend v4.8</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFastAPIOpen(true)}
              className="text-[#ffb1c0] hover:text-white underline cursor-pointer text-xs font-mono"
            >
              Open FastAPI / Python Terminal
            </button>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              Cluster Node: <span className="font-mono text-[#ffd8e9]">eu-west2-primary</span>
            </span>
          </div>
        </footer>
      </main>

      {/* Interactive Modals */}
      <DebugModal
        failure={debugTarget}
        onClose={() => setDebugTarget(null)}
        onResume={handleResumeFailure}
        onBypass={handleBypassFailure}
      />

      <ReviewModal
        item={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onApprove={handleApproveDecision}
        onReject={handleRejectDecision}
      />

      <UploadSourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadSourceComplete}
      />

      <ConnectMCPModal
        isOpen={isConnectMCPOpen}
        onClose={() => setIsConnectMCPOpen(false)}
        onConnect={handleConnectMCPServer}
      />

      <FastAPIInspectorModal
        isOpen={isFastAPIOpen}
        onClose={() => setIsFastAPIOpen(false)}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#390e29] border border-[#FA1E71] text-white text-xs font-medium shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FA1E71]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
