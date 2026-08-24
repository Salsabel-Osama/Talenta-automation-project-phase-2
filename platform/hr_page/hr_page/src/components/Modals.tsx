import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Cpu, 
  Check, 
  DollarSign, 
  Globe, 
  Layers, 
  ShieldCheck, 
  Send, 
  ExternalLink, 
  MapPin, 
  Briefcase,
  Building2,
  Upload,
  Database,
  Mail,
  Loader2
} from 'lucide-react';
import { AgentSpec, Candidate, PipelineRun } from '../types';

/* -------------------------------------------------------------
 * 1. Deploy Agent Modal
 * ------------------------------------------------------------- */
interface DeployAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (agent: Partial<AgentSpec>) => void;
}

export const DeployAgentModal: React.FC<DeployAgentModalProps> = ({
  isOpen,
  onClose,
  onDeploy
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [autonomy, setAutonomy] = useState<AgentSpec['autonomyLevel']>('Human-in-the-Loop');
  const [systemPrompt, setSystemPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    onDeploy({
      name,
      role,
      autonomyLevel: autonomy,
      systemPrompt: systemPrompt || 'Custom specialized talent acquisition logic.',
      status: 'active',
      runsCount: 0,
      successRate: 100,
      description: `Autonomous agent configured for ${role.toLowerCase()}.`
    });
    setName('');
    setRole('');
    setSystemPrompt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#240018] border border-[#532440] rounded-3xl w-full max-w-xl p-6 lg:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#3a0f2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#fa1e71]" />
            </div>
            <div>
              <h3 className="font-heading text-[18px] font-bold text-white">
                Deploy New HR Autonomous Agent
              </h3>
              <p className="text-[12px] text-[#e5bdc3]">Configure role, tools, and execution policy</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#ab888d] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Agent Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead Sourcing Crawler"
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Specialized Role & Focus
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Distributed Systems & Rust Recruiter"
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Autonomy Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Strict Approval', 'Human-in-the-Loop', 'Full Auto'] as AgentSpec['autonomyLevel'][]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setAutonomy(level)}
                  className={`py-2 px-3 rounded-xl text-[12px] font-medium border text-center transition-all ${
                    autonomy === level
                      ? 'bg-[#fa1e71] text-white border-[#fa1e71] font-bold'
                      : 'bg-[#2b031d] text-[#ab888d] border-[#471a35] hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Custom Prompt & Guardrails
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Specify evaluation rubric, negative filters (e.g. no junior applicants), and token caps..."
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-full text-[13px] text-[#e5bdc3] hover:text-white hover:bg-[#350b26]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold shadow-md shadow-[#fa1e71]/20 cursor-pointer"
            >
              Deploy Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. Create Run Modal
 * ------------------------------------------------------------- */
interface CreateRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (run: Partial<PipelineRun>) => void;
}

export const CreateRunModal: React.FC<CreateRunModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [roleTitle, setRoleTitle] = useState('');
  const [department, setDepartment] = useState('Core AI Infrastructure');
  const [targetBudget, setTargetBudget] = useState('$200,000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle) return;
    onCreate({
      roleTitle,
      department,
      targetBudget,
      activeAgents: ['Planning Agent', 'RAG Agent', 'State-Graph Agent'],
      status: 'Running',
      candidatesFound: 0,
      completedSteps: 1,
      totalSteps: 4,
      startTime: 'Just now'
    });
    setRoleTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#240018] border border-[#532440] rounded-3xl w-full max-w-lg p-6 lg:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#3a0f2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#fa1e71]" />
            </div>
            <div>
              <h3 className="font-heading text-[18px] font-bold text-white">
                Launch Autonomous Recruitment Run
              </h3>
              <p className="text-[12px] text-[#e5bdc3]">Initialize multi-agent graph search</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#ab888d] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Requisition Title
            </label>
            <input
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer"
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
                Target Compensation Cap
              </label>
              <input
                type="text"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="$200k"
                className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#2b031d] border border-[#471a35] text-[12px] text-[#e5bdc3]/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fa1e71] shrink-0" />
            <span>Assigned agents will automatically decompose search, vector alignment, and market checks.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-full text-[13px] text-[#e5bdc3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold shadow-md shadow-[#fa1e71]/20 cursor-pointer"
            >
              Start Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. Candidate Detail Modal
 * ------------------------------------------------------------- */
interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onGenerateOutreach?: (candidate: Candidate) => void;
  isGeneratingOutreach?: boolean;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onGenerateOutreach,
  isGeneratingOutreach = false
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#240018] border border-[#532440] rounded-3xl w-full max-w-2xl p-6 lg:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-[#3a0f2a]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#3a0f2a] border-2 border-[#fa1e71] flex items-center justify-center font-heading text-[20px] font-bold text-white shadow-lg shrink-0">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-heading text-[20px] font-bold text-white leading-tight">
                {candidate.name}
              </h3>
              <p className="text-[13px] text-[#fa1e71] font-semibold">{candidate.title}</p>
              <p className="text-[12px] text-[#ab888d] flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" /> {candidate.company} • <MapPin className="w-3 h-3" /> {candidate.location}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#ab888d] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-[#2b031d] border border-[#471a35]">
            <span className="text-[11px] text-[#ab888d] uppercase font-bold block">Vector Match</span>
            <span className="text-[18px] font-bold text-[#fa1e71]">{candidate.matchScore}%</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#2b031d] border border-[#471a35]">
            <span className="text-[11px] text-[#ab888d] uppercase font-bold block">Experience</span>
            <span className="text-[18px] font-bold text-white">{candidate.experience}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#2b031d] border border-[#471a35]">
            <span className="text-[11px] text-[#ab888d] uppercase font-bold block">Expectation</span>
            <span className="text-[18px] font-bold text-emerald-400">{candidate.expectedSalary}</span>
          </div>
        </div>

        {/* AI Screening Notes */}
        <div className="p-4 rounded-xl bg-[#2b031d] border border-[#532440] space-y-2">
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#ffd8e9] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fa1e71]" />
            Agent Evaluation & Sourcing Rationale
          </h4>
          <p className="text-[13px] text-[#ffd8e9]/90 leading-relaxed">
            {candidate.notes}
          </p>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] mb-2">
            Verified Stack & Domain Expertise
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-[#350b26] text-[#ffd8e9] border border-[#532440] text-[12px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3a0f2a]">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-full text-[13px] text-[#e5bdc3] hover:text-white"
          >
            Close
          </button>
          <button
            disabled={isGeneratingOutreach}
            onClick={() => {
              if (onGenerateOutreach) {
                onGenerateOutreach(candidate);
              }
            }}
            className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold shadow-md shadow-[#fa1e71]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingOutreach ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate Outreach Sequence</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 4. Modify Parameters Modal
 * ------------------------------------------------------------- */
interface ModifyParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: { budget: string; stack: string; level: string }) => void;
}

export const ModifyParametersModal: React.FC<ModifyParametersModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [budget, setBudget] = useState('$230,000');
  const [stack, setStack] = useState('PyTorch, Libp2p, Decentralized Consensus, CUDA');
  const [level, setLevel] = useState('L6 Staff Engineer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ budget, stack, level });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#240018] border border-[#532440] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#3a0f2a]">
          <h3 className="font-heading text-[18px] font-bold text-white">
            Modify Sourcing Parameters
          </h3>
          <button onClick={onClose} className="text-[#ab888d] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Target Budget Constraint
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Required Technical Stack
            </label>
            <input
              type="text"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Target Seniority Level
            </label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-full text-[13px] text-[#e5bdc3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold shadow-md shadow-[#fa1e71]/20 cursor-pointer"
            >
              Apply & Re-orchestrate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 5. Index New Knowledge Document Modal
 * ------------------------------------------------------------- */
interface IndexDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIndex: (doc: { title: string; category: string; summary: string; profilesIndexed: string }) => void;
}

export const IndexDocumentModal: React.FC<IndexDocumentModalProps> = ({
  isOpen,
  onClose,
  onIndex
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Rubrics & Leveling');
  const [summary, setSummary] = useState('');
  const [profilesIndexed, setProfilesIndexed] = useState('1,200 Vector Embeddings');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;
    onIndex({ title, category, summary, profilesIndexed });
    setTitle('');
    setSummary('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#240018] border border-[#532440] rounded-3xl w-full max-w-lg p-6 lg:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#3a0f2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center">
              <Database className="w-5 h-5 text-[#fa1e71]" />
            </div>
            <div>
              <h3 className="font-heading text-[18px] font-bold text-white">
                Index Document into RAG Memory
              </h3>
              <p className="text-[12px] text-[#e5bdc3]">Vectorize hiring rubrics or salary benchmarks</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#ab888d] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026 Core Infrastructure Leveling Spec"
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
              >
                <option value="Rubrics & Leveling">Rubrics & Leveling</option>
                <option value="Market Intelligence">Market Intelligence</option>
                <option value="Talent Embeddings">Talent Embeddings</option>
                <option value="Outreach & Messaging">Outreach & Messaging</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
                Vector Count
              </label>
              <input
                type="text"
                value={profilesIndexed}
                onChange={(e) => setProfilesIndexed(e.target.value)}
                className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3] block mb-1.5">
              Summary / Content Embedding Description
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key competency criteria, compensation percentiles, or skill embeddings..."
              className="w-full bg-[#2b031d] text-[13px] text-white p-3 rounded-xl border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-full text-[13px] text-[#e5bdc3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold shadow-md shadow-[#fa1e71]/20 cursor-pointer"
            >
              Index Vectors
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 6. AI Outreach Preview & Decision Modal
 * ------------------------------------------------------------- */
interface OutreachResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  subject: string;
  body: string;
  onSendToQueue: () => void;
}

export const OutreachResultModal: React.FC<OutreachResultModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  subject,
  body,
  onSendToQueue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#240018] border border-[#532440] rounded-3xl w-full max-w-xl p-6 lg:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#3a0f2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#fa1e71]" />
            </div>
            <div>
              <h3 className="font-heading text-[18px] font-bold text-white">
                Personalized AI Outreach Sequence
              </h3>
              <p className="text-[12px] text-[#e5bdc3]">Targeting {candidateName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#ab888d] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#2b031d] border border-[#471a35]">
            <span className="text-[11px] text-[#ab888d] uppercase font-bold block mb-1">Subject Line</span>
            <p className="text-[13px] text-white font-semibold">{subject}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#1c0012] border border-[#3a0f2a] font-sans text-[13px] text-[#ffd8e9]/95 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
            {body}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-full text-[13px] text-[#e5bdc3] hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onSendToQueue();
              onClose();
            }}
            className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold shadow-md shadow-[#fa1e71]/20 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Send to Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
