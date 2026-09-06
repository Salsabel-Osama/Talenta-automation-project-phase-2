import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Terminal, 
  Zap,
  RotateCw,
  Search,
  Plus,
  Activity
} from 'lucide-react';
import { AgentSpec } from '../types';

interface AgentsViewProps {
  agents: AgentSpec[];
  onDeployAgentClick: () => void;
  onRunAgent: (agentId: string) => void;
  onUpdateAutonomy: (agentId: string, level: AgentSpec['autonomyLevel']) => void;
  testingAgentId?: string | null;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  onDeployAgentClick,
  onRunAgent,
  onUpdateAutonomy,
  testingAgentId = null
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-planning');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0] || {
    id: 'default',
    name: 'Agent',
    role: 'Specialist',
    iconType: 'planning',
    status: 'active',
    autonomyLevel: 'Human-in-the-Loop',
    runsCount: 0,
    successRate: 100,
    description: 'Autonomous agent',
    systemPrompt: 'Autonomous prompt.'
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2b031d] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#3a0f2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#240018]/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-[#fa1e71]" />
            <h2 className="font-heading text-[22px] font-bold text-white tracking-tight">
              Specialized HR Agent Swarm
            </h2>
          </div>
          <p className="text-[13px] text-[#e5bdc3]/80 mt-1">
            Autonomous multi-agent orchestration for sourcing, RAG vector alignment, and screening.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#ab888d] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter agents..."
              className="w-full bg-[#2b031d] text-[13px] text-white pl-8 pr-3 py-1.5 rounded-full border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>
          <button
            onClick={onDeployAgentClick}
            className="py-1.5 px-4 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md shadow-[#fa1e71]/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Agent</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Agent List */}
        <div className="w-full lg:w-1/2 border-r border-[#3a0f2a] overflow-y-auto p-6 space-y-3.5">
          {filteredAgents.map((agent) => {
            const isSelected = selectedAgent.id === agent.id;
            const isExecuting = testingAgentId === agent.id || agent.status === 'executing';

            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#350b26] border-[#fa1e71] shadow-xl shadow-[#fa1e71]/10'
                    : 'bg-[#240018] border-[#471a35] hover:border-[#61204a]'
                }`}
              >
                {/* Active left indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#fa1e71]" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#fa1e71]" />
                    </div>
                    <div>
                      <h3 className="font-heading text-[15px] font-bold text-white group-hover:text-[#ffd8e9]">
                        {agent.name}
                      </h3>
                      <p className="text-[12px] text-[#e5bdc3]/80 font-medium">
                        {agent.role}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isExecuting
                        ? 'bg-[#fa1e71]/20 text-[#fa1e71] border border-[#fa1e71]/40 animate-pulse'
                        : agent.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#3a0f2a] text-[#ab888d]'
                    }`}
                  >
                    ● {isExecuting ? 'executing' : agent.status}
                  </span>
                </div>

                <p className="text-[13px] text-[#e5bdc3]/90 mt-3 leading-relaxed line-clamp-2">
                  {agent.description}
                </p>

                {/* Stats Bar */}
                <div className="mt-4 pt-3 border-t border-[#3a0f2a]/70 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-4 text-[#ab888d]">
                    <span>Runs: <strong className="text-white">{agent.runsCount}</strong></span>
                    <span>Success: <strong className="text-emerald-400">{agent.successRate}%</strong></span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#fa1e71] bg-[#fa1e71]/10 px-2 py-0.5 rounded-full">
                    {agent.autonomyLevel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail & Configuration Panel */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-6 lg:p-8 bg-[#240018]/50 space-y-6">
          <div className="p-6 rounded-2xl bg-[#25091b] border border-[#471a35] shadow-xl space-y-5">
            {/* Agent Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#3a0f2a]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#471a35] border border-[#61204a] flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-[#fa1e71]" />
                </div>
                <div>
                  <h3 className="font-heading text-[18px] font-bold text-white">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-[13px] text-[#e5bdc3]">{selectedAgent.role}</p>
                </div>
              </div>

              <button
                onClick={() => onRunAgent(selectedAgent.id)}
                disabled={testingAgentId === selectedAgent.id}
                className="py-2 px-4 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#fa1e71]/20 cursor-pointer disabled:opacity-50"
              >
                {testingAgentId === selectedAgent.id ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Running Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Execution</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Execution Task */}
            {selectedAgent.currentTask && (
              <div className="p-3.5 rounded-xl bg-[#350b26] border border-[#532440]">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#fa1e71]">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Current Task Context</span>
                </div>
                <p className="text-[13px] text-white font-medium mt-1">
                  {selectedAgent.currentTask}
                </p>
              </div>
            )}

            {/* Autonomy Level Control */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]/80">
                Autonomy & Guardrails
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Strict Approval', 'Human-in-the-Loop', 'Full Auto'] as AgentSpec['autonomyLevel'][]).map((level) => (
                  <button
                    key={level}
                    onClick={() => onUpdateAutonomy(selectedAgent.id, level)}
                    className={`py-2 px-2.5 rounded-xl text-[12px] font-medium transition-all text-center border cursor-pointer ${
                      selectedAgent.autonomyLevel === level
                        ? 'bg-[#fa1e71] text-white border-[#fa1e71] shadow-md font-bold'
                        : 'bg-[#2b031d] text-[#ab888d] border-[#471a35] hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* System Prompt View / Config */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]/80 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#fa1e71]" />
                  System Instructions & Reasoning Policy
                </label>
                <span className="text-[11px] text-[#ab888d]">Gemini 2.5 Pro Tuned</span>
              </div>
              <div className="p-4 rounded-xl bg-[#1c0012] border border-[#3a0f2a] font-mono text-[12px] text-[#ffd8e9]/90 leading-relaxed max-h-48 overflow-y-auto">
                {selectedAgent.systemPrompt}
              </div>
            </div>

            {/* Capabilities and Connected Tools */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]/80">
                Connected Integration Tools
              </label>
              <div className="flex flex-wrap gap-2">
                {['Vector Knowledge Base', 'GitHub Code Graph', 'Live Salary Index', 'Greenhouse ATS Webhook', 'Slack Notification Bot'].map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#350b26] border border-[#532440] text-[11px] text-[#ffd8e9] font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
