import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { PipelineRun } from '../types';

interface RunsViewProps {
  runs: PipelineRun[];
  onCreateRunClick: () => void;
  onSelectRun?: (run: PipelineRun) => void;
}

export const RunsView: React.FC<RunsViewProps> = ({
  runs,
  onCreateRunClick,
  onSelectRun
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRun, setSelectedRun] = useState<PipelineRun>(runs[0]);

  const filteredRuns = runs.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2b031d] overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-[#3a0f2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#240018]/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-[#fa1e71]" />
            <h2 className="font-heading text-[22px] font-bold text-white tracking-tight">
              Recruitment Pipeline Runs
            </h2>
          </div>
          <p className="text-[13px] text-[#e5bdc3]/80 mt-1">
            Real-time multi-agent execution telemetry and candidate discovery funnels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#240018] p-1 rounded-full border border-[#471a35]">
            {['all', 'Running', 'Awaiting Review', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-[#3a0f2a] text-white font-semibold'
                    : 'text-[#ab888d] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={onCreateRunClick}
            className="py-1.5 px-4 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#fa1e71]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Run</span>
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Runs List */}
        <div className="w-full lg:w-3/5 border-r border-[#3a0f2a] overflow-y-auto p-6 space-y-3.5">
          {filteredRuns.map((run) => {
            const isSelected = selectedRun.id === run.id;
            return (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#350b26] border-[#fa1e71] shadow-xl'
                    : 'bg-[#240018] border-[#471a35] hover:border-[#61204a]'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#fa1e71]" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#ab888d] bg-[#2b031d] px-2 py-0.5 rounded border border-[#3a0f2a]">
                        {run.id}
                      </span>
                      <span className="text-[12px] text-[#e5bdc3]/70">{run.department}</span>
                    </div>
                    <h3 className="font-heading text-[16px] font-bold text-white mt-1 group-hover:text-[#ffd8e9]">
                      {run.roleTitle}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                      run.status === 'Running'
                        ? 'bg-[#fa1e71]/20 text-[#fa1e71] border border-[#fa1e71]/40 animate-pulse'
                        : run.status === 'Awaiting Review'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    ● {run.status}
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#2b031d]/80 border border-[#3a0f2a] text-[12px]">
                  <div>
                    <span className="text-[#ab888d] block text-[11px]">Budget Target</span>
                    <span className="font-semibold text-white">{run.targetBudget}</span>
                  </div>
                  <div>
                    <span className="text-[#ab888d] block text-[11px]">Candidates Found</span>
                    <span className="font-semibold text-[#fa1e71]">{run.candidatesFound} profiles</span>
                  </div>
                  <div>
                    <span className="text-[#ab888d] block text-[11px]">Progress</span>
                    <span className="font-semibold text-emerald-400">
                      Step {run.completedSteps} of {run.totalSteps}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#ab888d]">
                  <div className="flex items-center gap-1.5">
                    <span>Active Agents:</span>
                    <span className="text-[#ffd8e9]">{run.activeAgents.join(', ')}</span>
                  </div>
                  <span>{run.startTime}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Run Execution Graph & Logs */}
        <div className="w-full lg:w-2/5 overflow-y-auto p-6 space-y-6 bg-[#240018]/50">
          <div className="p-6 rounded-2xl bg-[#25091b] border border-[#471a35] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#3a0f2a]">
              <div>
                <h3 className="font-heading text-[16px] font-bold text-white">
                  Execution Telemetry
                </h3>
                <p className="text-[11px] text-[#ab888d] font-mono">{selectedRun.id}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#350b26] text-[#fa1e71] text-[11px] font-bold">
                {selectedRun.status}
              </span>
            </div>

            {/* Stepper Graph */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]">
                Agent Workflow Sequence
              </h4>
              <div className="space-y-3">
                {[
                  { title: '1. Requisition Decomposition', agent: 'Planning Agent', done: true, time: '120ms' },
                  { title: '2. Internal RAG Alignment (12k profiles)', agent: 'Memory/RAG Agent', done: selectedRun.completedSteps >= 2, time: '410ms' },
                  { title: '3. Cyclic External Graph Sourcing', agent: 'State-Graph Agent', done: selectedRun.completedSteps >= 3, time: '890ms' },
                  { title: '4. Candidate Calibration & Outreach', agent: 'Screening Agent', done: selectedRun.completedSteps >= 4, time: 'Pending' },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      step.done
                        ? 'bg-[#2b031d] border-[#532440] text-white'
                        : 'bg-[#240018] border-[#3a0f2a] text-[#ab888d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        step.done ? 'bg-[#fa1e71] text-white' : 'bg-[#350b26] text-[#ab888d]'
                      }`}>
                        {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold">{step.title}</p>
                        <p className="text-[10px] text-[#ab888d]">{step.agent}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#fa1e71]">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Terminal Logs */}
            <div className="space-y-2">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]">
                Live Agent Execution Logs
              </h4>
              <div className="p-3.5 rounded-xl bg-[#1c0012] border border-[#3a0f2a] font-mono text-[11px] text-[#ffd8e9]/80 space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-emerald-400">[10:41:02] Orchestrator: Initialized search pipeline for {selectedRun.roleTitle}</p>
                <p className="text-[#ffd8e9]">[10:41:04] Planning Agent: Target compensation constraint initialized: {selectedRun.targetBudget}</p>
                <p className="text-amber-400">[10:41:09] RAG: Embedding match similarity scored 0.94 against alumni vector graph</p>
                <p className="text-[#fa1e71]">[10:41:14] StateGraph: Discovered {selectedRun.candidatesFound} candidate repositories on GitHub</p>
                <p className="text-[#ab888d]">[10:41:18] Screener: Awaiting Human-in-the-Loop review for budget override flags...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
