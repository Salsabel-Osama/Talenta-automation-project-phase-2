import React, { useState } from 'react';
import { 
  UserCheck, 
  Brain, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Sparkles,
  Search,
  Briefcase
} from 'lucide-react';
import { DecisionItem } from '../types';

interface HumanReviewViewProps {
  decisions: DecisionItem[];
  onOpenReview: (item: DecisionItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const HumanReviewView: React.FC<HumanReviewViewProps> = ({
  decisions,
  onOpenReview,
  onApprove,
  onReject,
}) => {
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'medium'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = decisions.filter(item => {
    if (filterConfidence === 'high' && item.confidence < 80) return false;
    if (filterConfidence === 'medium' && item.confidence >= 80) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.candidateName.toLowerCase().includes(q) || 
             item.candidateRole.toLowerCase().includes(q) ||
             item.title.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div id="human-review-view" className="flex-1 flex flex-col space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-display">
            Human-in-the-Loop (HITL) Queue
          </h2>
          <p className="text-sm text-[#e5bdc3]/70 mt-1 font-normal">
            Supervisory decision gate for salary approvals, edge-case qualifications, and executive overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              decisions.filter(d => d.status === 'pending').forEach(d => onApprove(d.id));
            }}
            className="px-4 py-2 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve All High-Confidence</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#25091b] border border-[#61204A]/50 shadow-md">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, or task..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white placeholder:text-[#ab888d]/50 focus:outline-none focus:border-[#FA1E71]"
          />
          <Search className="w-3.5 h-3.5 text-[#ab888d] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-[#d8aab4]">Filter Confidence:</span>
          <button
            onClick={() => setFilterConfidence('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterConfidence === 'all'
                ? 'bg-[#FA1E71] text-white'
                : 'bg-[#350b26] text-[#d8aab4] hover:text-white'
            }`}
          >
            All ({decisions.length})
          </button>
          <button
            onClick={() => setFilterConfidence('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterConfidence === 'high'
                ? 'bg-[#FA1E71] text-white'
                : 'bg-[#350b26] text-[#d8aab4] hover:text-white'
            }`}
          >
            High (&gt;80%)
          </button>
          <button
            onClick={() => setFilterConfidence('medium')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterConfidence === 'medium'
                ? 'bg-[#FA1E71] text-white'
                : 'bg-[#350b26] text-[#d8aab4] hover:text-white'
            }`}
          >
            Requires Audit (&lt;80%)
          </button>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            id={`decision-card-${item.id}`}
            className="p-5 rounded-2xl bg-[#25091b] border border-[#61204A]/50 hover:border-[#ffb1c0]/40 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-white">
                  {item.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#350b26] border border-[#532440] font-mono text-xs text-[#ffd8e9]">
                  {item.graphState}
                </span>
                <span className="text-xs text-[#d8aab4]/60">
                  • {item.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#ffb1c0]">
                  {item.candidateName}
                </span>
                <span className="text-xs text-[#d8aab4]">
                  {item.candidateRole} ({item.experienceYears}y exp)
                </span>
              </div>

              <p className="text-xs text-[#ffd8e9]/80 leading-relaxed line-clamp-2 pr-4">
                {item.aiReasoning}
              </p>
            </div>

            {/* Confidence & Action buttons */}
            <div className="flex items-center gap-5 shrink-0 self-end lg:self-center">
              <div className="text-right">
                <span className="text-[11px] text-[#d8aab4] block mb-1">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-[#350b26] overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.confidence >= 80 ? 'bg-[#FA1E71]' : 'bg-[#eab308]'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{item.confidence}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReject(item.id)}
                  className="p-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                  title="Reject / Escalate"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onApprove(item.id)}
                  className="p-2 rounded-full border border-green-500/30 text-green-400 hover:bg-green-500/15 transition-colors cursor-pointer"
                  title="Direct Approve"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenReview(item)}
                  className="px-4 py-2 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Inspect & Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
