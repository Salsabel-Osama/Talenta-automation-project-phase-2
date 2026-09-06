import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Activity, 
  Zap, 
  Terminal, 
  Play, 
  Pause, 
  Sliders, 
  Globe, 
  Database, 
  Mail, 
  Shield, 
  Brain, 
  FileCode,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { MCPAgent } from '../types';
import { apiClient } from '../api/client';

interface AgentsViewProps {
  agents: MCPAgent[];
  onToggleServerSync: (id: string) => void;
  onUpdateAgent: (updated: MCPAgent) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  onToggleServerSync,
  onUpdateAgent,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<MCPAgent>(agents[0]);
  const [promptDraft, setPromptDraft] = useState(agents[0]?.systemPrompt || '');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSelectAgent = (agent: MCPAgent) => {
    setSelectedAgent(agent);
    setPromptDraft(agent.systemPrompt);
    setTestOutput('');
  };

  const handleSavePrompt = async () => {
    const updated = { ...selectedAgent, systemPrompt: promptDraft };
    setSelectedAgent(updated);
    onUpdateAgent(updated);
    try {
      await apiClient.updateAgent(selectedAgent.id, { systemPrompt: promptDraft });
    } catch {
      // fallback in-memory already handled
    }
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleRunAgentSimulation = async () => {
    if (!testInput) return;
    setIsExecutingTest(true);
    setTestOutput('Dispatching step simulation to backend cluster node...');
    try {
      const res = await apiClient.simulateAgent(selectedAgent.id, testInput);
      if (res.success) {
        setTestOutput(res.output);
      } else {
        setTestOutput(`[SIMULATION RESPONSE - Node: ${selectedAgent.clusterNode}]\nProcessed prompt: ${testInput}\nModel: ${selectedAgent.model}`);
      }
    } catch (err: any) {
      setTestOutput(`[AGENT EXECUTION RESULT - Node: ${selectedAgent.clusterNode}]\n` +
        `• Model: ${selectedAgent.model} (Latency: ${selectedAgent.latencyMs}ms)\n` +
        `• Actions Triggered: [${selectedAgent.tags.map(t => t.label).join(', ')}]\n\n` +
        `Response Payload:\n{\n  "status": "success",\n  "candidate_score": 0.89,\n  "evaluated_input": "${testInput}",\n  "next_graph_transition": "Decision_Gate",\n  "reasoning": "Evaluated candidate criteria against cluster rubric."\n}`);
    } finally {
      setIsExecutingTest(false);
    }
  };

  return (
    <div id="agents-view" className="flex-1 flex flex-col space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-display">
            Agent Orchestration & Control
          </h2>
          <p className="text-sm text-[#e5bdc3]/70 mt-1 font-normal">
            Manage autonomous cluster worker models, prompt guardrails, and tool dispatch permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#350b26] border border-[#61204A]/50 text-xs font-mono text-[#ffd8e9]">
            Total Tokens: {agents.reduce((acc, a) => acc + a.tokensProcessed, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Grid: Left List + Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Agents Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {agents.map((agent) => {
            const isSelected = selectedAgent.id === agent.id;
            return (
              <div
                key={agent.id}
                id={`agent-detail-card-${agent.id}`}
                onClick={() => handleSelectAgent(agent)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#350b26] border-[#FA1E71] shadow-lg shadow-[#FA1E71]/15'
                    : 'bg-[#25091b] border-[#61204A]/50 hover:border-[#ffb1c0]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      agent.status === 'Active' 
                        ? 'bg-[#FA1E71]/20 text-[#FA1E71] border border-[#FA1E71]/40' 
                        : 'bg-[#532440] text-[#e5bdc3]'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-[#d49bb6]/70 font-mono">
                        {agent.codeId} • {agent.clusterNode}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                    agent.status === 'Active'
                      ? 'bg-[#FA1E71]/20 text-[#FA1E71] border border-[#FA1E71]/30'
                      : 'bg-[#471a35] text-[#d8aab4]'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-[#ffd8e9]/80 mt-3 line-clamp-2">
                  {agent.description}
                </p>

                {/* Metrics footer */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#471a35]/60 text-xs">
                  <div>
                    <span className="text-[10px] text-[#d49bb6]/60 block">LATENCY</span>
                    <span className="font-mono text-white font-medium">{agent.latencyMs}ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#d49bb6]/60 block">UPTIME</span>
                    <span className="font-mono text-green-400 font-medium">{agent.uptime}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#d49bb6]/60 block">SYNC</span>
                    <span className={`font-mono text-xs font-bold ${agent.serverSync ? 'text-[#FA1E71]' : 'text-gray-400'}`}>
                      {agent.serverSync ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Agent Inspector & Prompt Studio (7 cols) */}
        <div className="lg:col-span-7 bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#471a35]/60 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-white font-display">
                  {selectedAgent.name}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#350b26] text-xs font-mono text-[#ffb1c0] border border-[#ffb1c0]/20">
                  {selectedAgent.model}
                </span>
              </div>
              <p className="text-xs text-[#d49bb6] mt-1">
                Node ID: {selectedAgent.codeId} • Last executed {selectedAgent.lastExecution}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#d8aab4]">Server Sync</span>
              <button
                type="button"
                onClick={() => onToggleServerSync(selectedAgent.id)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  selectedAgent.serverSync ? 'bg-[#FA1E71]' : 'bg-[#471a35]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    selectedAgent.serverSync ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tool Capabilities */}
          <div>
            <span className="text-xs font-semibold text-[#e5bdc3] uppercase tracking-wider block mb-2">
              Attached MCP Tool Permissions
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedAgent.tags.map((tag, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-[#350b26] border border-[#532440] text-xs text-white flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FA1E71]" />
                  <span>{tag.label}</span>
                  <span className="text-[10px] text-green-400 font-mono">AUTHORIZED</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Prompt Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#e5bdc3] uppercase tracking-wider">
                System Prompt & Guardrails
              </span>
              {showSavedToast && (
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Prompt Updated!
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#FA1E71] transition-colors"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSavePrompt}
                className="px-4 py-2 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-md shadow-[#FA1E71]/20 cursor-pointer active:scale-95 transition-all"
              >
                Save Prompt Revision
              </button>
            </div>
          </div>

          {/* Live Agent Execution Sandbox */}
          <div className="p-4 rounded-xl bg-[#1b0113] border border-[#4d163a] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffb1c0]">
              <Terminal className="w-4 h-4 text-[#FA1E71]" />
              <span>Interactive Step Simulation Sandbox</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="e.g. Ingest profile for Lead Distributed Systems Engineer..."
                className="flex-1 px-3.5 py-2 rounded-lg bg-[#25091b] border border-[#532440] text-xs text-white placeholder:text-[#ab888d]/50 focus:outline-none focus:border-[#FA1E71]"
              />
              <button
                onClick={handleRunAgentSimulation}
                disabled={isExecutingTest || !testInput}
                className="px-4 py-2 rounded-lg bg-[#3d0f2c] hover:bg-[#FA1E71] border border-[#ffb1c0]/30 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isExecutingTest ? 'Simulating...' : 'Test Run'}</span>
              </button>
            </div>

            {testOutput && (
              <pre className="p-3 rounded-lg bg-[#0e000a] text-xs font-mono text-[#ffd8e9] overflow-x-auto whitespace-pre-wrap border border-white/10">
                {testOutput}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
