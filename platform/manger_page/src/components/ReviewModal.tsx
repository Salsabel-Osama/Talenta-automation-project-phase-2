import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Sparkles, 
  DollarSign, 
  Briefcase, 
  Brain, 
  UserCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { DecisionItem } from '../types';

interface ReviewModalProps {
  item: DecisionItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  item,
  onClose,
  onApprove,
  onReject,
}) => {
  const [adjustedBudget, setAdjustedBudget] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!item) return null;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onApprove(item.id);
      onClose();
    }, 600);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onReject(item.id);
      onClose();
    }, 600);
  };

  return (
    <div 
      id="review-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        id="review-modal-container"
        className="w-full max-w-2xl bg-[#28051e] border border-[#6b1e4c]/60 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4d163a]/60 bg-[#320826]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FA1E71]/20 border border-[#FA1E71]/40 flex items-center justify-center text-[#FA1E71]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display">
                  {item.title}
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-[#532440] text-[#ffafd8] border border-[#ffafd8]/20">
                  {item.graphState}
                </span>
              </div>
              <p className="text-xs text-[#d8aab4] mt-0.5">
                Human-in-the-loop validation barrier • Triggered {item.timestamp}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Candidate Profile Highlight */}
          <div className="p-4 rounded-xl bg-[#390e29]/70 border border-[#6b1e4c]/50 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#981549] to-[#FA1E71] flex items-center justify-center text-white font-bold text-lg font-display">
                {item.candidateName.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {item.candidateName}
                </h4>
                <p className="text-xs text-[#ffb1c0] flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {item.candidateRole} • {item.experienceYears} Years Exp
                </p>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="text-right">
              <div className="text-xs text-[#d8aab4] mb-1">AI Confidence</div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-[#532440] overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.confidence >= 80 ? 'bg-[#FA1E71]' : 'bg-[#eab308]'
                    }`}
                    style={{ width: `${item.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white font-mono">
                  {item.confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Compensation Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#210217] border border-[#4d163a]">
              <div className="text-xs text-[#d8aab4] mb-1">Candidate Expectation</div>
              <div className="text-sm font-semibold text-white font-mono">
                {item.salaryExpectation}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#210217] border border-[#4d163a]">
              <div className="text-xs text-[#d8aab4] mb-1">Budget Allocation</div>
              <div className="text-sm font-semibold text-[#ffafd8] font-mono">
                {item.budgetAllocated}
              </div>
            </div>
          </div>

          {/* AI Reasoning Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#4d1235]/50 to-[#28051e] border border-[#FA1E71]/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#FA1E71]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Orchestrator Reasoning & Rubric Analysis
              </span>
            </div>
            <p className="text-xs text-[#ffd8e9]/90 leading-relaxed">
              {item.aiReasoning}
            </p>
          </div>

          {/* Key Strengths & Skills */}
          <div>
            <div className="text-xs font-semibold text-[#e5bdc3] mb-2 uppercase tracking-wider">
              Verified Technical Competencies
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[#3c0f2a] border border-[#ffb1c0]/20 text-xs text-[#ffd8e9]"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="space-y-1.5">
              {item.keyStrengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#d8aab4]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FA1E71] shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Human Note (Optional) */}
          <div>
            <label className="block text-xs font-medium text-[#d8aab4] mb-1.5">
              Executive Reviewer Instructions / Adjustments
            </label>
            <input
              type="text"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g. Approve +5k relocation stipend or override level to L6..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white placeholder:text-[#ab888d]/50 focus:outline-none focus:border-[#FA1E71] transition-colors"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#4d163a]/60 bg-[#320826]/70">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-full border border-red-500/40 text-xs font-medium text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject / Archive</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-medium text-[#d8aab4] hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-lg shadow-[#FA1E71]/30 hover:shadow-[#FA1E71]/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Validating...' : 'Approve & Release Node'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
