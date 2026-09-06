import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Code2, 
  Terminal, 
  Layers, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { CriticalFailure } from '../types';

interface DebugModalProps {
  failure: CriticalFailure | null;
  onClose: () => void;
  onResume: (failureId: string) => void;
  onBypass: (failureId: string) => void;
}

export const DebugModal: React.FC<DebugModalProps> = ({
  failure,
  onClose,
  onResume,
  onBypass,
}) => {
  const [isResuming, setIsResuming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customPayload, setCustomPayload] = useState('');
  const [activeTab, setActiveTab] = useState<'stack' | 'payload' | 'graph'>('stack');

  if (!failure) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(failure.stackTrace);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResumeClick = () => {
    setIsResuming(true);
    setTimeout(() => {
      setIsResuming(false);
      onResume(failure.id);
      onClose();
    }, 900);
  };

  return (
    <div 
      id="debug-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        id="debug-modal-container"
        className="w-full max-w-3xl bg-[#28051e] border border-[#6b1e4c]/60 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4d163a]/60 bg-[#320826]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#93000a]/40 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white font-display">
                  Debug & Resume Execution
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-[#532440] text-[#ffb1c0] border border-[#ffb1c0]/20">
                  {failure.runId}
                </span>
              </div>
              <p className="text-xs text-[#d8aab4] mt-0.5">
                Node: <span className="font-mono text-[#ffb1c0]">{failure.node}</span> in graph <span className="font-mono text-white/90">{failure.graphName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#e5bdc3]/60 hover:text-white hover:bg-[#4d163a]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Error Summary Banner */}
          <div className="p-4 rounded-xl bg-[#3c0c2a]/80 border border-[#981549]/50 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FA1E71]">
                {failure.errorType}
              </span>
              <h4 className="text-base font-semibold text-white mt-0.5">
                {failure.title}
              </h4>
              <p className="text-xs text-[#d8aab4] mt-1">
                Triggered {failure.timeAgo} at {failure.timestamp}. Cluster execution halted at barrier condition.
              </p>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#FA1E71]/20 text-[#FA1E71] text-xs font-medium border border-[#FA1E71]/30">
              State: Interrupted
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#4d163a]/60 pb-1">
            <button
              onClick={() => setActiveTab('stack')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'stack'
                  ? 'bg-[#FA1E71] text-white shadow-sm'
                  : 'text-[#d8aab4] hover:text-white hover:bg-[#3c0c2a]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Stack Trace</span>
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'payload'
                  ? 'bg-[#FA1E71] text-white shadow-sm'
                  : 'text-[#d8aab4] hover:text-white hover:bg-[#3c0c2a]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Input State Payload</span>
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'graph'
                  ? 'bg-[#FA1E71] text-white shadow-sm'
                  : 'text-[#d8aab4] hover:text-white hover:bg-[#3c0c2a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Graph Execution Path</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'stack' && (
            <div className="relative rounded-xl bg-[#1b0113] border border-[#4d163a] p-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                <span className="text-xs font-mono text-[#d8aab4]/60">runtime_exception.log</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-[#FA1E71] hover:text-[#ff9bb4] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-[#ffb4ab] leading-relaxed whitespace-pre-wrap select-text">
                {failure.stackTrace}
              </pre>
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="rounded-xl bg-[#1b0113] border border-[#4d163a] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#d8aab4]/60">state_context.json</span>
              </div>
              <pre className="font-mono text-xs text-[#ffd8e9] leading-relaxed select-text">
                {JSON.stringify(failure.inputPayload, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="rounded-xl bg-[#1b0113] border border-[#4d163a] p-5 space-y-4">
              <div className="text-xs text-[#d8aab4] font-medium">Execution Pipeline Steps:</div>
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                <div className="px-3 py-2 rounded-lg bg-[#3d0f2c] border border-green-500/40 text-xs font-mono text-green-300 flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  Candidate_Ingest (240ms)
                </div>
                <span className="text-[#FA1E71]">→</span>
                <div className="px-3 py-2 rounded-lg bg-[#3d0f2c] border border-green-500/40 text-xs font-mono text-green-300 flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  Skill_Extraction (510ms)
                </div>
                <span className="text-[#FA1E71]">→</span>
                <div className="px-3 py-2 rounded-lg bg-[#5a0023] border border-[#FA1E71] text-xs font-mono text-white flex items-center gap-1.5 shrink-0 shadow-lg shadow-[#FA1E71]/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FA1E71]" />
                  {failure.node} (HALTED)
                </div>
                <span className="text-white/30">→</span>
                <div className="px-3 py-2 rounded-lg bg-[#2b031d] border border-dashed border-white/20 text-xs font-mono text-white/40 shrink-0">
                  Outreach_Trigger (Pending)
                </div>
              </div>
            </div>
          )}

          {/* AI Remediation Insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#4d1235]/60 to-[#2b031d] border border-[#FA1E71]/30 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#FA1E71]/20 text-[#FA1E71] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                Autonomous Diagnostic Recommendation
              </h5>
              <p className="text-xs text-[#ffd8e9]/90 mt-1 leading-relaxed">
                {failure.node === 'Email_Dispatch' 
                  ? 'Switch to tenant backup pool adapter and apply backoff jitter (2000ms). Node is safe to resume with fresh rate quota.' 
                  : 'Force release lock on barrier lock 0x7F9B and route via asynchronous review resolution.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#4d163a]/60 bg-[#320826]/70">
          <button
            onClick={() => {
              onBypass(failure.id);
              onClose();
            }}
            className="px-4 py-2.5 rounded-full border border-[#ab888d]/30 text-xs font-medium text-[#e5bdc3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Bypass & Mark Resolved
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-medium text-[#d8aab4] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleResumeClick}
              disabled={isResuming}
              className="px-5 py-2.5 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-lg shadow-[#FA1E71]/30 hover:shadow-[#FA1E71]/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isResuming ? (
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isResuming ? 'Re-executing Node...' : 'Debug & Resume'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
