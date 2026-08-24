import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  Database, 
  Network, 
  Send, 
  Plus, 
  Check, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  Layers,
  Cpu,
  UserCheck,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AgentMode, Candidate, ChatMessage, TaskCard } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, agentMode: AgentMode) => void;
  onApproveExecution: () => void;
  onModifyParameters: () => void;
  onCandidateClick?: (candidate: Candidate) => void;
  discoveredCandidates: Candidate[];
  activeAgentMode: AgentMode;
  onAgentModeChange: (mode: AgentMode) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onApproveExecution,
  onModifyParameters,
  onCandidateClick,
  discoveredCandidates,
  activeAgentMode,
  onAgentModeChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isExecuting]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue, activeAgentMode);
    setInputValue('');
  };

  const quickPrompts = [
    'Find Lead Rust / Distributed Systems Architect ($220k)',
    'Benchmark Staff Frontend compensation in EMEA',
    'Decompose Executive Search for VP of AI Research',
    'Screen top 5 PyTorch candidates against L6 rubric'
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2b031d] relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#fa1e71]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#61204a]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Agent Mode Selector */}
      <div className="py-4 px-6 flex items-center justify-center border-b border-[#3a0f2a]/60 bg-[#2b031d]/70 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5 p-1 bg-[#240018] rounded-full border border-[#471a35]">
          {/* State-Graph Pill */}
          <button
            onClick={() => onAgentModeChange('state-graph')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              activeAgentMode === 'state-graph'
                ? 'bg-[#532440] text-white shadow-sm border border-[#61204a]'
                : 'text-[#e5bdc3]/80 hover:text-white hover:bg-[#350b26]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#ffb1c0]" />
            <span>State-Graph</span>
          </button>

          {/* Memory/RAG Pill */}
          <button
            onClick={() => onAgentModeChange('memory-rag')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              activeAgentMode === 'memory-rag'
                ? 'bg-[#532440] text-white shadow-sm border border-[#61204a]'
                : 'text-[#e5bdc3]/80 hover:text-white hover:bg-[#350b26]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#ffb1c0]" />
            <span>Memory/RAG</span>
          </button>

          {/* Planning Agent Pill */}
          <button
            onClick={() => onAgentModeChange('planning')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              activeAgentMode === 'planning'
                ? 'bg-[#532440] text-white shadow-sm border border-[#61204a] font-semibold'
                : 'text-[#e5bdc3]/80 hover:text-white hover:bg-[#350b26]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#fa1e71]" />
            <span>Planning Agent</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-6 space-y-7">
        {messages.map((message) => {
          if (message.sender === 'user') {
            return (
              <div key={message.id} className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                <div className="max-w-2xl bg-[#350b26] border border-[#532440] rounded-2xl rounded-tr-sm p-4.5 text-white shadow-lg text-[14px] leading-relaxed">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              {/* Agent Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center shadow-md">
                  <Network className="w-4 h-4 text-[#fa1e71]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[14px] font-bold text-white tracking-wide">
                    {message.agentName || 'Planning Agent'}
                  </span>
                  <span className="text-[11px] text-[#ab888d] font-medium">
                    {message.timestamp}
                  </span>
                </div>
              </div>

              {/* Main Agent Bubble Card */}
              <div className="bg-[#240018]/90 border border-[#471a35] rounded-2xl p-5 lg:p-6 shadow-xl space-y-5 max-w-3xl">
                <p className="text-[14px] text-[#ffd8e9] leading-relaxed">
                  {message.content}
                </p>

                {/* Sub-tasks Grid */}
                {message.tasks && message.tasks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {message.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-[#2b031d] border border-[#532440] flex flex-col justify-between space-y-3 hover:border-[#61204a] transition-all"
                      >
                        {/* Task Card Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {task.assignedAgentType === 'rag' ? (
                              <Database className="w-3.5 h-3.5 text-[#ffd8e9]/80" />
                            ) : (
                              <Network className="w-3.5 h-3.5 text-[#fa1e71]" />
                            )}
                            <span className="text-[11px] font-bold text-white tracking-wider uppercase">
                              TASK {task.taskNumber}: {task.title}
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full bg-[#532440] text-[#ffd8e9] text-[10px] font-semibold border border-[#61204a]/60 whitespace-nowrap">
                            Assigned: {task.assignedAgent}
                          </span>
                        </div>

                        {/* Task Card Description */}
                        <p className="text-[12px] text-[#e5bdc3]/85 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {message.actionRequired && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={onApproveExecution}
                      className="py-2.5 px-6 rounded-full bg-[#fa1e71] hover:bg-[#e01662] active:scale-[0.98] text-white font-semibold text-[13px] shadow-lg shadow-[#fa1e71]/25 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Execution</span>
                    </button>
                    <button
                      onClick={onModifyParameters}
                      className="py-2.5 px-6 rounded-full text-[13px] font-semibold text-[#fa1e71] border border-[#fa1e71] hover:bg-[#fa1e71]/10 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Modify Parameters
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Candidate Cards stream if candidates are discovered */}
        {discoveredCandidates.length > 0 && (
          <div className="space-y-4 pt-2 max-w-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#fa1e71]" />
                <h3 className="font-heading text-[15px] font-bold text-white">
                  Live Discovered Candidates ({discoveredCandidates.length})
                </h3>
              </div>
              <span className="text-[12px] text-[#e5bdc3]/80">Sorted by Vector Cosine Match</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoveredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => onCandidateClick && onCandidateClick(candidate)}
                  className="p-4 rounded-xl bg-[#240018] border border-[#532440] hover:border-[#fa1e71] transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="w-1 h-full bg-[#fa1e71] absolute left-0 top-0" />
                  
                  <div className="flex items-start justify-between gap-2 mb-2 pl-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#3a0f2a] border border-[#fa1e71]/40 flex items-center justify-center font-bold text-white text-[12px] shrink-0">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white group-hover:text-[#fa1e71] transition-colors leading-tight">
                          {candidate.name}
                        </h4>
                        <p className="text-[11px] text-[#ab888d]">{candidate.company}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#fa1e71]/20 text-[#fa1e71] text-[11px] font-bold border border-[#fa1e71]/40">
                      {candidate.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-[#ffd8e9]/80 pl-1.5 line-clamp-2 mb-2.5 leading-relaxed">
                    {candidate.notes}
                  </p>

                  <div className="flex flex-wrap gap-1 pl-1.5 pt-1 border-t border-[#350b26]">
                    {candidate.skills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#3a0f2a] text-[#ffd8e9] text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="text-[10px] text-[#ab888d] self-center">
                        +{candidate.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 lg:px-12 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-[#ab888d] whitespace-nowrap">Suggested:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt, activeAgentMode)}
            className="px-3 py-1 rounded-full bg-[#240018] hover:bg-[#3a0f2a] border border-[#471a35] text-[11px] text-[#e5bdc3] hover:text-white transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Chat Input Form */}
      <div className="p-4 lg:p-6 pt-2 border-t border-[#3a0f2a]/80 bg-[#2b031d]/90 backdrop-blur-md">
        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-3 bg-[#240018] border border-[#471a35] rounded-2xl p-2 pl-3.5 focus-within:border-[#fa1e71] transition-all shadow-xl"
        >
          {/* Plus Attachment Button */}
          <button
            type="button"
            onClick={() => alert('Add candidate resume, job specification document, or CSV candidate list for agent parsing.')}
            className="w-8 h-8 rounded-full hover:bg-[#350b26] flex items-center justify-center text-[#ab888d] hover:text-white transition-colors cursor-pointer"
            title="Attach Job Spec or Resume"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Prompt Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Instruct the agent..."
            className="flex-1 bg-transparent text-[14px] text-white placeholder-[#ab888d] focus:outline-none px-2"
          />

          {/* Pink Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-9 h-9 rounded-xl bg-[#fa1e71] hover:bg-[#e01662] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#fa1e71] text-white flex items-center justify-center transition-all shadow-md shadow-[#fa1e71]/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
