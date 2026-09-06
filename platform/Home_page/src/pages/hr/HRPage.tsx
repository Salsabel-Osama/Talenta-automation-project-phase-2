import React, { useState } from 'react';
import { ExtendedCandidate, INITIAL_CANDIDATES } from '../../data/mockCandidates';
import {
  Sliders,
  Database,
  Users,
  Search,
  CheckCircle2,
  Filter,
  LogOut,
  Mail,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Calendar,
  Check,
  Send,
} from 'lucide-react';

interface HRPageProps {
  currentUser: string;
  onLogout: () => void;
}

export const HRPage: React.FC<HRPageProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'settings' | 'integrations'>('candidates');
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>('cand-1');

  // Sourcing Settings State
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(85);
  const [anonymizeDemographics, setAnonymizeDemographics] = useState<boolean>(true);
  const [autoVerifyCode, setAutoVerifyCode] = useState<boolean>(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const allSkills = ['All', 'React 19', 'TypeScript', 'Vector DBs', 'Go', 'Kubernetes', 'PyTorch', 'Python', 'MLflow'];

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill = selectedSkill === 'All' || c.skills.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleStatusChange = (candId: string, newStatus: ExtendedCandidate['status']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: newStatus } : c))
    );
    showToast(`Candidate status updated to: ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const handleSendToManager = (candId: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: 'shortlisted' } : c))
    );
    showToast('Candidate dossier successfully dispatched to Manager Review Room!');
  };

  return (
    <div className="min-h-screen bg-[#1a0110] text-[#fdf4f8] pt-20 pb-16">
      {/* Top Bar for Logged in HR */}
      <div className="bg-[#2b031d] border-b border-white/10 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FA1E71]/20 border border-[#FA1E71]/40 flex items-center justify-center text-[#FA1E71]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">HR & Talent Operations Console</h1>
                <span className="text-[10px] font-semibold bg-[#FA1E71]/20 text-[#FA1E71] px-2 py-0.5 rounded-full border border-[#FA1E71]/30">
                  HR Portal
                </span>
              </div>
              <p className="text-xs text-[#d9c6d1]">
                Logged in as: <span className="text-[#FA1E71] font-semibold font-mono">{currentUser}</span> • Talent Ingestion & Pipeline Operations
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
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('candidates')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_18px_rgba(250,30,113,0.4)]'
                : 'bg-surface-bright/40 text-[#d9c6d1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidate Sourcing Pipeline ({filteredCandidates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_18px_rgba(250,30,113,0.4)]'
                : 'bg-surface-bright/40 text-[#d9c6d1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Neural Matching Thresholds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_18px_rgba(250,30,113,0.4)]'
                : 'bg-surface-bright/40 text-[#d9c6d1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>ATS / HRIS Sync Connectors</span>
          </button>
        </div>

        {/* Global Toast */}
        {feedbackToast && (
          <div className="mb-6 p-4 rounded-xl bg-[#FA1E71]/20 border border-[#FA1E71] text-xs font-semibold text-white flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#FA1E71]" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* TAB 1: Candidates Management */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            {/* Sourcing Search & Filter Bar */}
            <div className="ecosystem-card rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#d9c6d1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, role, or technical keywords..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#110009] border border-white/15 focus:border-[#FA1E71] rounded-xl text-xs text-white placeholder-white/40 outline-none"
                  />
                </div>

                {/* Sourcing Summary Metric */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="px-3.5 py-2 bg-surface-bright/50 rounded-xl border border-white/10">
                    <span className="text-[#d9c6d1]">Indexed Pool:</span>{' '}
                    <span className="font-bold text-white">8,420 profiles</span>
                  </div>
                  <div className="px-3.5 py-2 bg-[#FA1E71]/15 text-[#FA1E71] rounded-xl border border-[#FA1E71]/30 font-semibold">
                    <span>Active Cutoff: {similarityThreshold}%</span>
                  </div>
                </div>
              </div>

              {/* Skill Pill Filter */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                <span className="text-[11px] text-[#d9c6d1] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-[#FA1E71]" /> Filter by Skill:
                </span>
                {allSkills.map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => setSelectedSkill(sk)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedSkill === sk
                        ? 'bg-[#FA1E71] text-white font-semibold shadow-[0_0_10px_rgba(250,30,113,0.4)]'
                        : 'bg-white/5 text-[#d9c6d1] hover:bg-white/10'
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates List */}
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => {
                const isExpanded = expandedCandidateId === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    className="ecosystem-card rounded-2xl border border-white/10 hover:border-[#FA1E71]/40 transition-all overflow-hidden"
                  >
                    {/* Main Row */}
                    <div className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-4">
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#FA1E71]/30"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FA1E71]/15 text-[#FA1E71] text-xs font-bold font-mono">
                              {candidate.matchScore}% Match
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                candidate.status === 'shortlisted'
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                                  : candidate.status === 'in_review'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {candidate.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-[#d9c6d1] mt-0.5">{candidate.role}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#d9c6d1] mt-1.5 flex-wrap">
                            <span>{candidate.location}</span>
                            <span>•</span>
                            <span>{candidate.experienceYears} Years Experience</span>
                            <span>•</span>
                            <span className="text-[#FA1E71] font-semibold">{candidate.velocity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Skills & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendToManager(candidate.id)}
                          className="px-4 py-2 rounded-xl bg-[#FA1E71] hover:bg-[#ff4d94] text-white text-xs font-semibold shadow-[0_0_15px_rgba(250,30,113,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch to Manager</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Dossier' : 'View Dossier'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Deep Dossier */}
                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-[#110009]/50 space-y-4 animate-in slide-in-from-top-1 duration-200">
                        <div className="p-3.5 rounded-xl bg-surface-card border border-white/5">
                          <div className="text-xs font-bold text-[#FA1E71] mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Talenta Neural Synthesis & Proven Strengths</span>
                          </div>
                          <p className="text-xs text-[#d9c6d1] leading-relaxed">{candidate.aiSummary}</p>
                        </div>

                        {/* Candidate Skills Breakdown */}
                        <div>
                          <div className="text-[11px] font-semibold text-[#d9c6d1] mb-2">Verified Skill Embeddings:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.map((sk) => (
                              <span key={sk} className="px-2.5 py-1 rounded-lg bg-surface-bright text-xs font-medium text-white border border-white/5">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Projects & Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-white/5 text-xs space-y-1">
                            <div className="text-white font-semibold">Repository Artifacts:</div>
                            <ul className="list-disc list-inside text-[11px] text-[#d9c6d1] space-y-0.5">
                              {candidate.keyProjects.map((p) => (
                                <li key={p}>{p}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 text-xs space-y-2">
                            <div className="text-white font-semibold">HR Status Routing:</div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(candidate.id, 'shortlisted')}
                                className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-300 text-[11px] font-semibold hover:bg-green-500/30 transition-colors"
                              >
                                Mark Shortlisted
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(candidate.id, 'contacted')}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-semibold hover:bg-blue-500/30 transition-colors"
                              >
                                Mark Contacted
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(candidate.id, 'in_review')}
                                className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-[11px] font-semibold hover:bg-yellow-500/30 transition-colors"
                              >
                                Under Review
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Sourcing Parameters Settings */}
        {activeTab === 'settings' && (
          <div className="ecosystem-card rounded-3xl p-6 sm:p-8 border border-white/10 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FA1E71]" />
                <span>Neural Sourcing & Matching Thresholds</span>
              </h2>
              <p className="text-xs text-[#d9c6d1]">
                Configure autonomous talent ingestion filters, semantic cutoff points, and bias-reduction parameters.
              </p>
            </div>

            {/* Threshold Slider */}
            <div className="p-5 rounded-2xl bg-[#110009]/80 border border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#d9c6d1] font-semibold">Minimum Semantic Match Threshold</span>
                <span className="text-[#FA1E71] font-bold font-mono text-sm">{similarityThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                className="w-full accent-[#FA1E71] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#d9c6d1]">
                <span>Wide Ingestion Net (60%)</span>
                <span>Balanced Precision (80%)</span>
                <span>Strict Top-Tier Only (98%)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-surface-bright/40 border border-white/5 cursor-pointer hover:border-[#FA1E71]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={anonymizeDemographics}
                  onChange={(e) => setAnonymizeDemographics(e.target.checked)}
                  className="accent-[#FA1E71] mt-1 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FA1E71]" />
                    <span>Blind Equity Shielding</span>
                  </div>
                  <div className="text-[11px] text-[#d9c6d1] mt-1">
                    Automatically anonymizes names, gender markers, and photos during preliminary vector indexing to eliminate unconscious bias.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-surface-bright/40 border border-white/5 cursor-pointer hover:border-[#FA1E71]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={autoVerifyCode}
                  onChange={(e) => setAutoVerifyCode(e.target.checked)}
                  className="accent-[#FA1E71] mt-1 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#FA1E71]" />
                    <span>Deep Code Verification</span>
                  </div>
                  <div className="text-[11px] text-[#d9c6d1] mt-1">
                    Continuously correlates git commits, algorithmic patterns, and unit tests to synthesize verified velocity metrics.
                  </div>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('HR Sourcing Configuration successfully saved and deployed!')}
                className="px-6 py-3 rounded-xl bg-[#FA1E71] hover:bg-[#ff4d94] text-white text-xs font-semibold shadow-[0_0_20px_rgba(250,30,113,0.4)] transition-all cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: ATS / HRIS Integrations */}
        {activeTab === 'integrations' && (
          <div className="ecosystem-card rounded-3xl p-6 sm:p-8 border border-white/10 max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#FA1E71]" />
                <span>Enterprise ATS & HRIS Connectors</span>
              </h2>
              <p className="text-xs text-[#d9c6d1]">
                Real-time bi-directional synchronizers ensuring seamless status updates across your existing tooling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#110009]/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Workday HRIS</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                </div>
                <p className="text-[11px] text-[#d9c6d1]">Synced 2 mins ago. Requisitions auto-mapped to Talenta Neural Clusters.</p>
                <div className="pt-2 border-t border-white/10 text-[10px] text-green-400 font-mono">Status: Connected</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#110009]/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Greenhouse ATS</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                </div>
                <p className="text-[11px] text-[#d9c6d1]">Candidate dossiers and interview feedback push directly into stage queues.</p>
                <div className="pt-2 border-t border-white/10 text-[10px] text-green-400 font-mono">Status: Live Webhook</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#110009]/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Lever Pipeline</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                </div>
                <p className="text-[11px] text-[#d9c6d1]">Autonomous candidate status callbacks enabled for fast recruiter notifications.</p>
                <div className="pt-2 border-t border-white/10 text-[10px] text-green-400 font-mono">Status: Synced</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
