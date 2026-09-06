import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Ticket, 
  Terminal, 
  RotateCw, 
  CheckCircle2, 
  Layers, 
  ShieldAlert,
  Play
} from 'lucide-react';
import { CriticalFailure } from '../types';

interface FailureTicketsViewProps {
  failures: CriticalFailure[];
  onOpenDebug: (failure: CriticalFailure) => void;
  onBypass: (id: string) => void;
  onResume: (id: string) => void;
}

export const FailureTicketsView: React.FC<FailureTicketsViewProps> = ({
  failures,
  onOpenDebug,
  onBypass,
  onResume,
}) => {
  return (
    <div id="failure-tickets-view" className="flex-1 flex flex-col space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-display">
            Failure Tickets & Exception Triage
          </h2>
          <p className="text-sm text-[#e5bdc3]/70 mt-1 font-normal">
            Intercepted state deadlocks, rate-limit interrupts, and vector search anomalies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#93000a]/30 border border-[#ffb4ab]/30 text-xs font-mono text-[#ffb4ab]">
            {failures.length} Incident{failures.length === 1 ? '' : 's'} Recorded
          </div>
        </div>
      </div>

      {/* Failures List */}
      <div className="space-y-4">
        {failures.map((failure) => (
          <div
            key={failure.id}
            id={`ticket-card-${failure.id}`}
            className="p-6 rounded-2xl bg-[#25091b] border border-[#61204A]/50 hover:border-[#ffb1c0]/40 transition-all shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#471a35]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#93000a]/40 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-white">
                    {failure.runId}
                  </span>
                  <span className="text-xs text-[#d49bb6]/60 ml-2 font-sans">
                    • {failure.timeAgo} ({failure.timestamp})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#532440] text-[#ffb1c0]">
                  Node: {failure.node}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30">
                  {failure.errorType}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                {failure.title}
              </h4>
              <p className="text-xs text-[#d8aab4] mt-1 font-mono">
                Graph Pipeline: {failure.graphName}
              </p>
            </div>

            {/* Stack trace snippet */}
            <div className="p-3 rounded-xl bg-[#1b0113] border border-[#4d163a]">
              <pre className="font-mono text-xs text-[#ffb4ab] leading-relaxed whitespace-pre-wrap line-clamp-3">
                {failure.stackTrace}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#d8aab4]/70">
                Payload context: Candidate ID <span className="font-mono text-white">cand-89241</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onBypass(failure.id)}
                  className="px-4 py-2 rounded-full border border-[#ab888d]/30 text-xs font-medium text-[#e5bdc3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Bypass & Resolve
                </button>
                <button
                  onClick={() => onOpenDebug(failure)}
                  className="px-5 py-2 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Debug & Resume</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
