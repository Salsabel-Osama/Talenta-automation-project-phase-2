import React from 'react';
import { WorkspaceRole } from '../types';
import { ShieldCheck, Users, CheckCircle2, Lock, Sparkles, ArrowRight, LogIn } from 'lucide-react';

interface WorkspaceSectionProps {
  authenticatedRole: WorkspaceRole | null;
  authenticatedUser: string | null;
  onRequestLogin: (role: WorkspaceRole) => void;
  onEnterWorkspace: (role: WorkspaceRole) => void;
  onLogout: () => void;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  authenticatedRole,
  authenticatedUser,
  onRequestLogin,
  onEnterWorkspace,
  onLogout,
}) => {
  return (
    <section id="workspaces" className="py-24 relative bg-[#2b031d] z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FA1E71]/15 border border-[#FA1E71]/30 text-[#FA1E71] text-xs font-semibold uppercase tracking-wider mb-4">
            Protected Role-Based Consoles
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fdf4f8] mb-4 tracking-tight">
            Choose Your Workspace
          </h2>
          <p className="text-[#d9c6d1] text-base sm:text-lg leading-relaxed">
            Dedicated consoles for talent acquisition specialists and engineering team managers to collaborate with full transparency.
          </p>
        </div>

        {/* Security Info Card */}
        <div className="max-w-3xl mx-auto mb-10 p-5 rounded-2xl bg-[#110009]/80 border border-[#FA1E71]/30 shadow-[0_0_30px_rgba(250,30,113,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#FA1E71]/20 flex items-center justify-center text-[#FA1E71] flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Role-Based Access Control</span>
                <span className="text-[10px] bg-[#FA1E71]/20 text-[#FA1E71] px-2 py-0.5 rounded-full font-mono">
                  Enterprise Security
                </span>
              </div>
              <p className="text-xs text-[#d9c6d1] mt-0.5">
                Authentication required. Enter your authorized workspace credentials to access your designated portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FA1E71]" />
              <span>Encrypted Sessions</span>
            </span>
          </div>
        </div>

        {/* 2 Roles Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* HR Admin Card */}
          <div className="ecosystem-card rounded-3xl p-8 flex flex-col relative group border border-white/10 hover:border-[#FA1E71]/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FA1E71]/15 flex items-center justify-center text-[#FA1E71] group-hover:bg-[#FA1E71] group-hover:text-white transition-all shadow-[0_0_15px_rgba(250,30,113,0.3)]">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  admin_panel_settings
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">HR & Talent Operations</h3>
                <span className="text-xs text-[#FA1E71] font-semibold">Full Pipeline Management</span>
              </div>
            </div>

            <p className="text-[#d9c6d1] text-sm leading-relaxed mb-6 flex-grow">
              Configure AI sourcing parameters, oversee blind equity shielding, manage integrations with Workday / Greenhouse, and dispatch candidate dossiers to managers.
            </p>

            {/* Scope info */}
            <div className="mb-6 p-3 rounded-xl bg-[#110009]/60 border border-white/5 text-xs text-[#d9c6d1] space-y-1">
              <div className="text-[11px] text-[#ff4d94] font-semibold">Workspace Clearance:</div>
              <div className="text-[11px] text-[#d9c6d1]">
                Candidate Ingestion, AI Match Thresholds, ATS Connectors
              </div>
            </div>

            {authenticatedRole === 'hr' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onEnterWorkspace('hr')}
                  className="w-full text-center bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(250,30,113,0.35)] hover:shadow-[0_0_30px_rgba(250,30,113,0.6)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open HR Operations Console</span>
                </button>
                <div className="flex items-center justify-between text-xs text-[#d9c6d1] px-1">
                  <span>Active Session: <strong className="text-white">{authenticatedUser}</strong></span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-[#FA1E71] hover:underline cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequestLogin('hr')}
                className="w-full text-center bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(250,30,113,0.35)] hover:shadow-[0_0_30px_rgba(250,30,113,0.6)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to HR Workspace</span>
              </button>
            )}
          </div>

          {/* Hiring Manager Card */}
          <div className="ecosystem-card rounded-3xl p-8 flex flex-col relative group border border-white/10 hover:border-[#FA1E71]/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#FA1E71]/15 flex items-center justify-center text-[#FA1E71] group-hover:bg-[#FA1E71] group-hover:text-white transition-all shadow-[0_0_15px_rgba(250,30,113,0.3)]">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  groups
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Engineering & Team Manager</h3>
                <span className="text-xs text-[#FA1E71] font-semibold">Review & Decision Room</span>
              </div>
            </div>

            <p className="text-[#d9c6d1] text-sm leading-relaxed mb-6 flex-grow">
              Review curated candidate shortlists, examine verified code repositories, review automated technical scorecards, and submit 1-click hiring decisions.
            </p>

            {/* Scope info */}
            <div className="mb-6 p-3 rounded-xl bg-[#110009]/60 border border-white/5 text-xs text-[#d9c6d1] space-y-1">
              <div className="text-[11px] text-[#ff4d94] font-semibold">Workspace Clearance:</div>
              <div className="text-[11px] text-[#d9c6d1]">
                Candidate Dossiers, Technical Scorecards, 1-Click Hiring Decisions
              </div>
            </div>

            {authenticatedRole === 'manager' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onEnterWorkspace('manager')}
                  className="w-full text-center bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(250,30,113,0.35)] hover:shadow-[0_0_30px_rgba(250,30,113,0.6)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open Manager Decision Room</span>
                </button>
                <div className="flex items-center justify-between text-xs text-[#d9c6d1] px-1">
                  <span>Active Session: <strong className="text-white">{authenticatedUser}</strong></span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-[#FA1E71] hover:underline cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequestLogin('manager')}
                className="w-full text-center bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(250,30,113,0.35)] hover:shadow-[0_0_30px_rgba(250,30,113,0.6)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Manager Room</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
