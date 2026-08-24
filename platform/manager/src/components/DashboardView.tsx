import React from 'react';
import { 
  Network, 
  AlertTriangle, 
  Brain, 
  FileText, 
  RotateCw, 
  Globe, 
  Database, 
  Mail, 
  Upload, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { MCPAgent, CriticalFailure, DecisionItem, RAGDocument } from '../types';

interface DashboardViewProps {
  agents: MCPAgent[];
  failures: CriticalFailure[];
  decisions: DecisionItem[];
  ragSources: RAGDocument[];
  onToggleServerSync: (agentId: string) => void;
  onOpenDebug: (failure: CriticalFailure) => void;
  onOpenReview: (decision: DecisionItem) => void;
  onOpenUploadSource: () => void;
  onRefreshTelemetry: () => void;
  isRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  agents,
  failures,
  decisions,
  ragSources,
  onToggleServerSync,
  onOpenDebug,
  onOpenReview,
  onOpenUploadSource,
  onRefreshTelemetry,
  isRefreshing,
}) => {
  const activeAgentsCount = agents.filter(a => a.status === 'Active').length;
  const pendingDecisionsCount = decisions.filter(d => d.status === 'pending').length;

  return (
    <div id="dashboard-view" className="flex-1 flex flex-col space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div id="dashboard-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-display">
            System Health & Orchestration
          </h2>
          <p className="text-sm text-[#e5bdc3]/70 mt-1 font-normal">
            Live monitoring and control of the Manager Admin AI cluster.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Cluster Status Badge */}
          <div 
            id="cluster-status-pill"
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#350b26] border border-[#61204A]/50 text-xs font-medium text-[#ffd8e9] shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
            <span className="font-medium tracking-wide">Cluster Status: Optimal</span>
          </div>

          {/* Refresh Button */}
          <button
            id="btn-refresh-telemetry"
            onClick={onRefreshTelemetry}
            title="Refresh Cluster Telemetry"
            className="w-10 h-10 rounded-full bg-[#350b26] border border-[#61204A]/50 hover:border-[#FA1E71]/70 text-[#e5bdc3] hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-[#471a35] active:scale-95"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FA1E71]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid 2x2 Layout */}
      <div id="dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TOP LEFT: Live MCP Cluster (7 columns) */}
        <div 
          id="card-live-mcp-cluster"
          className="lg:col-span-7 bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              {/* Network Synapse Icon */}
              <div className="text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight font-display">
                Live MCP Cluster
              </h3>
            </div>
            <span className="text-xs text-[#e5bdc3]/70 font-medium font-sans">
              {activeAgentsCount} Active Agents
            </span>
          </div>

          {/* Agents Row Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.slice(0, 2).map((agent) => (
              <div
                key={agent.id}
                id={`agent-card-${agent.id}`}
                className="bg-[#2b031d] border border-[#532440]/60 rounded-xl p-5 flex flex-col justify-between hover:border-[#ffb1c0]/30 transition-all"
              >
                <div>
                  {/* Title & Active badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-[#d49bb6]/70 mt-0.5 font-mono">
                        ID: {agent.codeId}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#3f0f2a] text-[#ffafd8] border border-[#ffafd8]/30">
                      {agent.status}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {agent.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#350b26] border border-[#5c3f44]/40 text-xs text-[#ffd8e9]/90 font-medium"
                      >
                        {tag.icon === 'search' && <Globe className="w-3.5 h-3.5 text-[#ffafd8]" />}
                        {tag.icon === 'database' && <Database className="w-3.5 h-3.5 text-[#ffafd8]" />}
                        {tag.icon === 'mail' && <Mail className="w-3.5 h-3.5 text-[#ffafd8]" />}
                        <span>{tag.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Server Sync Toggle */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#471a35]/60">
                  <span className="text-xs text-[#e5bdc3]/80 font-normal">
                    Server Sync
                  </span>
                  
                  {/* Custom Styled Switch matching screenshot */}
                  <button
                    id={`toggle-sync-${agent.id}`}
                    type="button"
                    role="switch"
                    aria-checked={agent.serverSync}
                    onClick={() => onToggleServerSync(agent.id)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      agent.serverSync ? 'bg-[#FA1E71]' : 'bg-[#471a35]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                        agent.serverSync ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP RIGHT: Critical Failures (5 columns) */}
        <div 
          id="card-critical-failures"
          className="lg:col-span-5 bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <AlertTriangle className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white tracking-tight font-display">
              Critical Failures
            </h3>
          </div>

          {/* Failure Items */}
          <div className="space-y-4">
            {failures.slice(0, 2).map((failure) => (
              <div
                key={failure.id}
                id={`failure-item-${failure.id}`}
                className="bg-[#2b031d] border border-[#532440]/60 rounded-xl p-4.5 space-y-3"
              >
                {/* Run & Time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white font-mono">
                    {failure.runId}
                  </span>
                  <span className="text-[#d49bb6]/60 text-[11px]">
                    {failure.timeAgo}
                  </span>
                </div>

                {/* Error Title */}
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  {failure.title}
                </h4>

                {/* Node Box */}
                <div className="px-3 py-1.5 rounded-lg bg-[#1e0214] border border-[#471a35]/60 text-xs font-mono text-[#e5bdc3]">
                  Node: {failure.node}
                </div>

                {/* Action Button */}
                <button
                  id={`btn-debug-resume-${failure.id}`}
                  onClick={() => onOpenDebug(failure)}
                  className="w-full py-2.5 px-4 rounded-full border border-[#FA1E71]/80 hover:bg-[#FA1E71]/15 text-[#ffb1c0] hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-98"
                >
                  Debug & Resume
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM LEFT: Decision Queue (HITL) (7 columns) */}
        <div 
          id="card-decision-queue"
          className="lg:col-span-7 bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-6 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight font-display">
                Decision Queue (HITL)
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#900c44] text-[#ffd8e9] border border-[#ff9bb4]/30">
              {pendingDecisionsCount} Pending
            </span>
          </div>

          {/* Decision Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#d49bb6]/70 border-b border-[#471a35]/50 pb-3">
                  <th className="font-normal pb-3 w-44">Task / Candidate</th>
                  <th className="font-normal pb-3">Graph State</th>
                  <th className="font-normal pb-3 w-36">Confidence</th>
                  <th className="font-normal pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#471a35]/40">
                {decisions.slice(0, 2).map((item, idx) => (
                  <tr key={item.id} id={`decision-row-${item.id}`} className="group hover:bg-[#2b031d]/50 transition-colors">
                    {/* Task / Candidate */}
                    <td className="py-4 pr-3">
                      <div className="font-semibold text-white text-xs leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#d49bb6]/70 mt-1">
                        {item.candidateName} - {item.candidateRole}
                      </div>
                    </td>

                    {/* Graph State */}
                    <td className="py-4 pr-3">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-[#350b26] border border-[#532440]/60 font-mono text-[11px] text-[#ffd8e9]/90">
                        {item.graphState}
                      </span>
                    </td>

                    {/* Confidence Progress Bar */}
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 rounded-full bg-[#350b26] overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              idx === 0 
                                ? 'bg-[#FA1E71]' 
                                : 'bg-[#eab308]'
                            }`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="font-medium text-white text-xs font-sans">
                          {item.confidence}%
                        </span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 text-right">
                      <button
                        id={`btn-review-${item.id}`}
                        onClick={() => onOpenReview(item)}
                        className="px-4 py-1.5 rounded-full border border-[#FA1E71]/80 hover:bg-[#FA1E71]/15 text-[#ffb1c0] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM RIGHT: RAG Sources (5 columns) */}
        <div 
          id="card-rag-sources"
          className="lg:col-span-5 bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <FileText className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight font-display">
                RAG Sources
              </h3>
            </div>

            {/* Document List */}
            <div className="space-y-3">
              {ragSources.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  id={`rag-doc-${doc.id}`}
                  className="bg-[#2b031d] border border-[#532440]/60 rounded-xl p-3.5 flex items-start gap-3 hover:border-[#ffb1c0]/30 transition-all"
                >
                  <div className="p-2 rounded-lg bg-[#350b26] text-[#ffd8e9] shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-[#d49bb6]/70 mt-0.5">
                      Synced: {doc.synced}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <div className="pt-6 mt-4">
            <button
              id="btn-upload-new-source"
              onClick={onOpenUploadSource}
              className="w-full py-3 px-4 rounded-full border border-[#61204A] hover:border-[#FA1E71] bg-[#2b031d] hover:bg-[#350b26] text-[#ffd8e9] hover:text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Source</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
