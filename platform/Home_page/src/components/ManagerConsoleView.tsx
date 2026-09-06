import React, { useState } from 'react';
import { ExtendedCandidate, INITIAL_CANDIDATES } from '../data/mockCandidates';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  LogOut,
  Sliders,
  FileCode2,
  MessageSquareCode,
  ShieldCheck,
  Zap,
  HelpCircle,
  Send,
  History,
  TrendingUp,
} from 'lucide-react';

interface ManagerConsoleViewProps {
  currentUser: string;
  onLogout: () => void;
}

interface DecisionLog {
  id: string;
  candidateName: string;
  action: string;
  timestamp: string;
  status: 'approved' | 'rejected' | 'interview_scheduled';
}

export const ManagerConsoleView: React.FC<ManagerConsoleViewProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'decision_room' | 'calibration' | 'audit_trail'>('decision_room');
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate>(INITIAL_CANDIDATES[0]);
  const [managerNotes, setManagerNotes] = useState<string>('');

  // Calibration Weights
  const [architectureWeight, setArchitectureWeight] = useState<number>(40);
  const [velocityWeight, setVelocityWeight] = useState<number>(35);
  const [communicationWeight, setCommunicationWeight] = useState<number>(25);

  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([
    {
      id: 'log-1',
      candidateName: 'Marcus Vance',
      action: 'Approved for Final Architecture Panel',
      timestamp: 'Today at 09:45 AM',
      status: 'approved',
    },
    {
      id: 'log-2',
      candidateName: 'Devon Takahashi',
      action: 'Scheduled Deep Technical Coding Review',
      timestamp: 'Yesterday at 04:20 PM',
      status: 'interview_scheduled',
    },
  ]);

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleDecision = (candidateId: string, actionType: 'approve' | 'interview' | 'reject') => {
    const target = candidates.find((c) => c.id === candidateId);
    if (!target) return;

    let newStatus: ExtendedCandidate['decisionStatus'] = 'pending';
    let actionText = '';
    let logStatus: DecisionLog['status'] = 'approved';

    if (actionType === 'approve') {
      newStatus = 'approved';
      actionText = `Approved ${target.name} for Final Executive Round`;
      logStatus = 'approved';
    } else if (actionType === 'interview') {
      newStatus = 'interview_scheduled';
      actionText = `Dispatched Interview Brief for ${target.name}`;
      logStatus = 'interview_scheduled';
    } else {
      newStatus = 'rejected';
      actionText = `Archived ${target.name} with feedback notes`;
      logStatus = 'rejected';
    }

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, decisionStatus: newStatus } : c))
    );

    const newLog: DecisionLog = {
      id: `log-${Date.now()}`,
      candidateName: target.name,
      action: actionText,
      timestamp: 'Just now',
      status: logStatus,
    };

    setDecisionLogs((prev) => [newLog, ...prev]);
    showToast(`${actionText}! Decision logged in audit trail.`);
  };

  return (
    <div className="min-h-screen bg-[#1a0110] text-[#fdf4f8] pt-20 pb-16">
      {/* Top Bar for Logged in Manager */}
      <div className="bg-[#2b031d] border-b border-white/10 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FA1E71]/20 border border-[#FA1E71]/40 flex items-center justify-center text-[#FA1E71]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                groups
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Engineering Manager Decision Room</h1>
                <span className="text-[10px] font-semibold bg-[#FA1E71]/20 text-[#FA1E71] px-2 py-0.5 rounded-full border border-[#FA1E71]/30">
                  Manager Portal
                </span>
              </div>
              <p className="text-xs text-[#d9c6d1]">
                Logged in as: <span className="text-[#FA1E71] font-semibold font-mono">{currentUser}</span> • Technical Governance & Approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 text-xs font-semibold text-white border border-white/15 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج (Logout)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('decision_room')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'decision_room'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_18px_rgba(250,30,113,0.4)]'
                : 'bg-surface-bright/40 text-[#d9c6d1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Shortlist & Decision Room</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calibration')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'calibration'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_18px_rgba(250,30,113,0.4)]'
                : 'bg-surface-bright/40 text-[#d9c6d1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Competency Calibration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_trail')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audit_trail'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_18px_rgba(250,30,113,0.4)]'
                : 'bg-surface-bright/40 text-[#d9c6d1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Decision Audit Logs ({decisionLogs.length})</span>
          </button>
        </div>

        {/* Global Toast */}
        {feedbackToast && (
          <div className="mb-6 p-4 rounded-xl bg-[#FA1E71]/20 border border-[#FA1E71] text-xs font-semibold text-white flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#FA1E71]" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* TAB 1: Decision Room (2-Column Shortlist & Dossier) */}
        {activeTab === 'decision_room' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Shortlist Candidates Selection */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Curated Engineering Shortlist ({candidates.length})
                </span>
                <span className="text-[11px] text-[#FA1E71] font-mono">Talenta Synthesized</span>
              </div>

              {candidates.map((c) => {
                const isSelected = selectedCandidate.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#380929] to-[#25041a] border-[#FA1E71] shadow-[0_0_20px_rgba(250,30,113,0.25)]'
                        : 'bg-[#2b031d]/70 border-white/10 hover:border-white/20 hover:bg-[#2b031d]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#FA1E71]/40 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{c.name}</h4>
                          <span className="text-xs font-mono font-bold text-[#FA1E71]">
                            {c.matchScore}%
                          </span>
                        </div>
                        <p className="text-xs text-[#d9c6d1] truncate">{c.role}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">
                            Arch {c.architectureScore}%
                          </span>
                          <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">
                            Vel {c.velocityScore}%
                          </span>
                          {c.decisionStatus === 'approved' && (
                            <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-semibold">
                              Approved
                            </span>
                          )}
                          {c.decisionStatus === 'interview_scheduled' && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                              Interviewing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Selected Candidate Deep Dive & One-Click Decision Panel */}
            <div className="lg:col-span-7">
              <div className="ecosystem-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6">
                {/* Candidate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedCandidate.avatar}
                      alt={selectedCandidate.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FA1E71]/50 shadow-[0_0_20px_rgba(250,30,113,0.3)]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-white">{selectedCandidate.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FA1E71] text-white text-xs font-bold font-mono">
                          {selectedCandidate.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-[#d9c6d1] mt-0.5">{selectedCandidate.role}</p>
                      <div className="text-[11px] text-[#ff4d94] mt-1 font-mono">{selectedCandidate.github}</div>
                    </div>
                  </div>
                </div>

                {/* Radar Competency Breakdown */}
                <div className="p-4 rounded-2xl bg-[#110009]/80 border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Evaluated Competency Index</span>
                    <span className="text-[11px] text-[#FA1E71]">Weight Adjusted</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-surface-bright/50 text-center border border-white/5">
                      <div className="text-[11px] text-[#d9c6d1]">Architecture ({architectureWeight}%)</div>
                      <div className="text-lg font-bold text-white mt-0.5">{selectedCandidate.architectureScore}/100</div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-[#FA1E71] h-full rounded-full" style={{ width: `${selectedCandidate.architectureScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-bright/50 text-center border border-white/5">
                      <div className="text-[11px] text-[#d9c6d1]">Velocity ({velocityWeight}%)</div>
                      <div className="text-lg font-bold text-white mt-0.5">{selectedCandidate.velocityScore}/100</div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-[#FA1E71] h-full rounded-full" style={{ width: `${selectedCandidate.velocityScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-bright/50 text-center border border-white/5">
                      <div className="text-[11px] text-[#d9c6d1]">Communication ({communicationWeight}%)</div>
                      <div className="text-lg font-bold text-white mt-0.5">{selectedCandidate.communicationScore}/100</div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-[#FA1E71] h-full rounded-full" style={{ width: `${selectedCandidate.communicationScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-1.5">
                  <div className="text-xs font-bold text-[#FA1E71] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Manager Technical Brief:</span>
                  </div>
                  <p className="text-xs text-[#d9c6d1] leading-relaxed">{selectedCandidate.aiSummary}</p>
                </div>

                {/* Suggested High-Signal Interview Questions */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquareCode className="w-4 h-4 text-[#FA1E71]" />
                    <span>Recommended Architectural Interview Questions:</span>
                  </div>
                  <div className="space-y-2">
                    {selectedCandidate.suggestedQuestions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#110009] border border-white/10 text-xs text-[#d9c6d1] flex items-start gap-2">
                        <span className="text-[#FA1E71] font-bold font-mono">Q{idx + 1}:</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manager Decision Actions */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Submit Hiring Decision (1-Click Action):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecision(selectedCandidate.id, 'approve')}
                      className="py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(34,197,94,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Candidate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(selectedCandidate.id, 'interview')}
                      className="py-3 px-4 rounded-xl bg-[#FA1E71] hover:bg-[#ff4d94] text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(250,30,113,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Request Interview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(selectedCandidate.id, 'reject')}
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Pass / Archive</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Evaluation Framework Calibration */}
        {activeTab === 'calibration' && (
          <div className="ecosystem-card rounded-3xl p-6 sm:p-8 border border-white/10 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FA1E71]" />
                <span>Technical Competency Calibration</span>
              </h2>
              <p className="text-xs text-[#d9c6d1]">
                Adjust how Talenta Partners prioritizes candidate attributes when generating scores for your engineering openings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#110009]/80 border border-white/10 space-y-6">
              {/* Architecture */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">System Architecture & Scalability</span>
                  <span className="font-mono text-[#FA1E71] font-bold">{architectureWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={architectureWeight}
                  onChange={(e) => setArchitectureWeight(Number(e.target.value))}
                  className="w-full accent-[#FA1E71] cursor-pointer"
                />
                <p className="text-[11px] text-[#d9c6d1]">Evaluates modular design, distributed consensus, and clean abstraction principles.</p>
              </div>

              {/* Velocity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Coding Velocity & Throughput</span>
                  <span className="font-mono text-[#FA1E71] font-bold">{velocityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={velocityWeight}
                  onChange={(e) => setVelocityWeight(Number(e.target.value))}
                  className="w-full accent-[#FA1E71] cursor-pointer"
                />
                <p className="text-[11px] text-[#d9c6d1]">Measures turnaround on complex feature PRs, algorithm efficiency, and bug resolution velocity.</p>
              </div>

              {/* Communication */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Technical Communication & Review Quality</span>
                  <span className="font-mono text-[#FA1E71] font-bold">{communicationWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={communicationWeight}
                  onChange={(e) => setCommunicationWeight(Number(e.target.value))}
                  className="w-full accent-[#FA1E71] cursor-pointer"
                />
                <p className="text-[11px] text-[#d9c6d1]">Analyzes PR comments clarity, technical specifications, and cross-functional design memos.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('Manager Evaluation Weights successfully updated and saved!')}
                className="px-6 py-3 rounded-xl bg-[#FA1E71] hover:bg-[#ff4d94] text-white text-xs font-semibold shadow-[0_0_20px_rgba(250,30,113,0.4)] transition-all cursor-pointer"
              >
                Save Calibration Preset
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Decision Audit Trail */}
        {activeTab === 'audit_trail' && (
          <div className="ecosystem-card rounded-3xl p-6 sm:p-8 border border-white/10 max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#FA1E71]" />
                  <span>Manager Decision Audit Logs</span>
                </h2>
                <p className="text-xs text-[#d9c6d1]">
                  Immutable event log of strategic hiring decisions and interview approvals recorded by <span className="text-white font-semibold">{currentUser}</span>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {decisionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#110009]/80 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        log.status === 'approved'
                          ? 'bg-green-500/20 text-green-300'
                          : log.status === 'interview_scheduled'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {log.status === 'approved' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : log.status === 'interview_scheduled' ? (
                        <Zap className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{log.action}</div>
                      <div className="text-xs text-[#d9c6d1]">Target: <span className="text-[#ff4d94]">{log.candidateName}</span></div>
                    </div>
                  </div>

                  <span className="text-xs text-[#d9c6d1] font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
