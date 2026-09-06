import React from 'react';
import { 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Bot, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Candidate, ReviewItem, WorkflowStep } from '../types';

interface ContextStreamProps {
  reviewItems: ReviewItem[];
  workflowSteps: WorkflowStep[];
  matchedCandidates: Candidate[];
  onOverrideBudget: (reviewId: string) => void;
  onKeepBudget: (reviewId: string) => void;
  onCandidateClick?: (candidate: Candidate) => void;
}

export const ContextStream: React.FC<ContextStreamProps> = ({
  reviewItems,
  workflowSteps,
  matchedCandidates,
  onOverrideBudget,
  onKeepBudget,
  onCandidateClick
}) => {
  const pendingReviews = reviewItems.filter((r) => r.status === 'pending');

  return (
    <aside className="w-[310px] lg:w-[340px] h-full bg-[#240018]/95 border-l border-[#3a0f2a] p-5 overflow-y-auto flex-shrink-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#350b26]">
        <h2 className="font-heading text-[16px] font-bold text-white tracking-wide">
          Context Stream
        </h2>
        <button 
          className="text-[#ab888d] hover:text-white p-1 rounded-lg hover:bg-[#350b26] transition-colors"
          title="Filter stream context"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Section 1: REQUIRES REVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-wider text-[#e5bdc3]/80 uppercase">
            Requires Review
          </span>
          {pendingReviews.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#fa1e71] text-white text-[11px] font-bold flex items-center justify-center">
              {pendingReviews.length}
            </span>
          )}
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#2b031d] border border-[#471a35]/60 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-[13px] font-medium text-white">All Clear</p>
            <p className="text-[11px] text-[#ab888d]">No pending human-in-the-loop decisions</p>
          </div>
        ) : (
          pendingReviews.slice(0, 1).map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-2xl bg-[#2b031d] border border-[#61204a] relative overflow-hidden shadow-lg"
            >
              {/* Alert Title */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#fa1e71]/15 border border-[#fa1e71]/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-[#fa1e71]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white leading-snug">
                    {review.title}
                  </h3>
                  <p className="text-[12px] text-[#e5bdc3]/85 leading-relaxed mt-1">
                    {review.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-1">
                <button
                  onClick={() => onOverrideBudget(review.id)}
                  className="flex-1 py-1.5 px-3 rounded-full text-[12px] font-semibold text-[#fa1e71] border border-[#fa1e71] hover:bg-[#fa1e71] hover:text-white transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap text-center"
                >
                  Override to $230k
                </button>
                <button
                  onClick={() => onKeepBudget(review.id)}
                  className="py-1.5 px-3 rounded-full text-[12px] font-medium text-[#ab888d] hover:text-white hover:bg-[#3a0f2a] transition-all cursor-pointer whitespace-nowrap"
                >
                  Keep $200k
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Section 2: ACTIVE WORKFLOW */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-wider text-[#e5bdc3]/80 uppercase">
            Active Workflow: ML Search
          </span>
          <span className="text-[11px] text-[#fa1e71] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fa1e71] animate-ping" />
            Live
          </span>
        </div>

        {/* Workflow Stepper */}
        <div className="relative pl-5 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#471a35]">
          {workflowSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            const isPending = step.status === 'pending';

            return (
              <div key={step.id} className="relative group">
                {/* Stepper Bullet */}
                <div
                  className={`absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                    isCompleted
                      ? 'bg-[#2b031d] border-[#fa1e71]'
                      : isInProgress
                      ? 'bg-[#fa1e71] border-white shadow-sm shadow-[#fa1e71]'
                      : 'bg-[#240018] border-[#532440]'
                  }`}
                >
                  {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-[#fa1e71]" />}
                </div>

                {/* Step Content */}
                <div>
                  <h4
                    className={`text-[13px] font-semibold leading-tight ${
                      isInProgress
                        ? 'text-white'
                        : isCompleted
                        ? 'text-[#ffd8e9]'
                        : 'text-[#ab888d]'
                    }`}
                  >
                    {step.name}
                  </h4>
                  <p className="text-[12px] text-[#e5bdc3]/70 mt-0.5 leading-relaxed">
                    {step.detail}
                  </p>

                  {/* Progress Bar for in-progress step */}
                  {isInProgress && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full h-1.5 bg-[#3a0f2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#fa1e71] to-[#ff9bb4] rounded-full transition-all duration-500"
                          style={{ width: `${step.progress || 68}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#ab888d]">
                        <span>Scanning vector embeddings</span>
                        <span className="text-[#fa1e71] font-semibold">{step.progress || 68}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discovered Candidates Stream */}
      {matchedCandidates.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#350b26]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold tracking-wider text-[#e5bdc3]/80 uppercase">
              Live Matched Profiles
            </span>
            <span className="text-[11px] text-[#ffd8e9] bg-[#3a0f2a] px-2 py-0.5 rounded-full font-medium">
              {matchedCandidates.length} found
            </span>
          </div>

          <div className="space-y-2.5">
            {matchedCandidates.slice(0, 3).map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => onCandidateClick && onCandidateClick(candidate)}
                className="p-3 rounded-xl bg-[#2b031d] hover:bg-[#350b26] border border-[#471a35] hover:border-[#fa1e71]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#3a0f2a] border border-[#fa1e71]/40 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white group-hover:text-[#fa1e71] transition-colors leading-tight">
                        {candidate.name}
                      </p>
                      <p className="text-[11px] text-[#ab888d] truncate max-w-[150px]">
                        {candidate.title}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#fa1e71]/15 text-[#fa1e71] border border-[#fa1e71]/30 text-[11px] font-bold">
                    {candidate.matchScore}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#e5bdc3]/70 pt-1 border-t border-[#3a0f2a]/60">
                  <span>{candidate.location.split('(')[0]}</span>
                  <span className="font-semibold text-white">{candidate.expectedSalary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
