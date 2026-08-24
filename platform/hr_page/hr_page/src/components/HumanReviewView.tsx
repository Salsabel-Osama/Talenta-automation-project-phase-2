import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  ShieldAlert, 
  Send, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { ReviewItem } from '../types';

interface HumanReviewViewProps {
  reviewItems: ReviewItem[];
  onOverride: (id: string) => void;
  onKeep: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const HumanReviewView: React.FC<HumanReviewViewProps> = ({
  reviewItems,
  onOverride,
  onKeep,
  onDismiss
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(reviewItems[0] || null);

  const filteredItems = reviewItems.filter(item => {
    if (selectedType === 'all') return true;
    return item.type === selectedType;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2b031d] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#3a0f2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#240018]/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#fa1e71]" />
            <h2 className="font-heading text-[22px] font-bold text-white tracking-tight">
              Human-in-the-Loop Governance
            </h2>
          </div>
          <p className="text-[13px] text-[#e5bdc3]/80 mt-1">
            Review critical agent decisions, budget thresholds, compliance verifications, and outreach sequences.
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-[#240018] p-1 rounded-full border border-[#471a35]">
          {['all', 'budget', 'compliance', 'outreach'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1 rounded-full text-[12px] font-medium transition-all capitalize ${
                selectedType === type
                  ? 'bg-[#3a0f2a] text-white font-semibold'
                  : 'text-[#ab888d] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Review Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Review Queue */}
        <div className="w-full lg:w-1/2 border-r border-[#3a0f2a] overflow-y-auto p-6 space-y-3.5">
          {filteredItems.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
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
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.severity === 'alert'
                        ? 'bg-[#fa1e71]/15 text-[#fa1e71] border border-[#fa1e71]/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#ab888d]">
                        {item.roleName}
                      </span>
                      <h3 className="font-heading text-[15px] font-bold text-white mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'pending'
                      ? 'bg-[#fa1e71]/20 text-[#fa1e71] border border-[#fa1e71]/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-[13px] text-[#e5bdc3]/90 mt-2.5 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#3a0f2a]/70">
                  <span className="text-[11px] text-[#ab888d]">Requires HR Manager Approval</span>
                  <span className="text-[12px] font-semibold text-[#fa1e71] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Review Decision <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Action & Detailed Resolution Area */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-6 lg:p-8 space-y-6 bg-[#240018]/50">
          {selectedItem ? (
            <div className="p-6 rounded-2xl bg-[#25091b] border border-[#471a35] shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#3a0f2a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#471a35] border border-[#61204a] flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-[#fa1e71]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-[17px] font-bold text-white">
                      {selectedItem.title}
                    </h3>
                    <p className="text-[12px] text-[#e5bdc3]">{selectedItem.roleName}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#350b26] text-[#ffd8e9] text-[11px] font-bold uppercase">
                  {selectedItem.type}
                </span>
              </div>

              {/* Detail Breakdown */}
              <div className="space-y-3 p-4 rounded-xl bg-[#2b031d] border border-[#532440]">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]">
                  AI Agent Reasoning & Context
                </h4>
                <p className="text-[13px] text-white leading-relaxed">
                  {selectedItem.description}
                </p>

                {selectedItem.metadata && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#3a0f2a] text-[12px]">
                    {selectedItem.metadata.originalValue && (
                      <div>
                        <span className="text-[#ab888d] block text-[11px]">Requested Cap:</span>
                        <span className="font-semibold text-white">{selectedItem.metadata.originalValue}</span>
                      </div>
                    )}
                    {selectedItem.metadata.marketAverage && (
                      <div>
                        <span className="text-[#ab888d] block text-[11px]">Market 50th Percentile:</span>
                        <span className="font-semibold text-[#fa1e71]">{selectedItem.metadata.marketAverage}</span>
                      </div>
                    )}
                    {selectedItem.metadata.candidateName && (
                      <div>
                        <span className="text-[#ab888d] block text-[11px]">Target Candidate:</span>
                        <span className="font-semibold text-white">{selectedItem.metadata.candidateName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#e5bdc3]">
                  Decision Action
                </label>

                {selectedItem.status === 'pending' ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onOverride(selectedItem.id)}
                      className="flex-1 py-3 px-5 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#fa1e71]/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Authorize Exception (Override)</span>
                    </button>
                    <button
                      onClick={() => onKeep(selectedItem.id)}
                      className="py-3 px-5 rounded-full text-[13px] font-semibold text-[#ffd8e9] border border-[#532440] hover:bg-[#350b26] transition-all cursor-pointer text-center"
                    >
                      Enforce Hard Cap
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#2b031d] border border-emerald-500/40 text-emerald-300 text-[13px] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Decision Recorded ({selectedItem.status.toUpperCase()})</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#ab888d] text-[14px]">
              Select a review item to view decision context
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
