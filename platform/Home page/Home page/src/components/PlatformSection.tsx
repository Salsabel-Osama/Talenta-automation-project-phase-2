import React, { useState } from 'react';
import { Users, Cpu, Building2, CheckCircle2, Search, Sliders, ShieldCheck, Database, Layers } from 'lucide-react';

export const PlatformSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ecosystem' | 'intelligence' | 'governance'>('ecosystem');

  return (
    <section id="platform" className="py-24 relative bg-[#2b031d] z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FA1E71]/15 border border-[#FA1E71]/30 text-[#FA1E71] text-xs font-semibold uppercase tracking-wider mb-4">
            Unified Talent Infrastructure
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fdf4f8] mb-4 tracking-tight">
            The Talent Ecosystem
          </h2>
          <p className="text-[#d9c6d1] text-base sm:text-lg leading-relaxed">
            A seamless triad connecting the right talent with high-impact roles through neural indexing,
            semantic matching, and human-governed approvals.
          </p>
        </div>

        {/* 3 Pillars Triad Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-16">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#FA1E71]/40 to-transparent transform -translate-y-1/2 z-0" />

          {/* Pillar 1: Candidates */}
          <div className="ecosystem-card rounded-2xl p-8 relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#350b26] border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(250,30,113,0.25)]">
              <Users className="w-8 h-8 text-[#FA1E71]" />
            </div>
            <h3 className="text-xl font-bold text-[#fdf4f8] mb-3">Candidates</h3>
            <p className="text-[#d9c6d1] text-sm leading-relaxed mb-4">
              Evaluated dynamically based on real skill taxonomy, verified code/project artifacts, and career trajectory.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-[#FA1E71] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Skill Vector Indexing</span>
            </div>
          </div>

          {/* Pillar 2: Talenta Partners Hub */}
          <div className="ecosystem-card rounded-2xl p-8 relative z-10 flex flex-col items-center text-center border-[#FA1E71]/50 shadow-[0_0_35px_rgba(250,30,113,0.2)] transform md:-translate-y-3 bg-gradient-to-b from-[#350b26] to-[#200416]">
            <div className="w-20 h-20 rounded-2xl bg-[#2b031d] border border-[#FA1E71] flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(250,30,113,0.5)] relative">
              <div className="absolute inset-0 rounded-2xl border border-[#FA1E71] animate-ping opacity-25" />
              <Cpu className="w-10 h-10 text-[#FA1E71]" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FA1E71] text-[11px] font-bold text-white uppercase tracking-wider mb-2">
              Neural Core
            </div>
            <h3 className="text-2xl font-bold text-[#fdf4f8] mb-3">Talenta Partners Hub</h3>
            <p className="text-[#d9c6d1] text-sm leading-relaxed mb-4">
              The intelligence engine analyzing candidate capability graphs, experience density, and cultural resonance.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-[#fdf4f8] font-medium bg-white/10 px-3 py-1 rounded-full">
              <span>96.8% Match Certainty</span>
            </div>
          </div>

          {/* Pillar 3: Companies */}
          <div className="ecosystem-card rounded-2xl p-8 relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#350b26] border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(250,30,113,0.25)]">
              <Building2 className="w-8 h-8 text-[#FA1E71]" />
            </div>
            <h3 className="text-xl font-bold text-[#fdf4f8] mb-3">Companies</h3>
            <p className="text-[#d9c6d1] text-sm leading-relaxed mb-4">
              Empowered with explainable candidate dossiers, automated interview briefs, and verified candidate shortlists.
            </p>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-[#FA1E71] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Decision Control</span>
            </div>
          </div>
        </div>

        {/* Feature Deep Dive Container */}
        <div className="ecosystem-card rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Info */}
            <div className="lg:w-1/2 space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#fdf4f8]">
                Beyond Simple Keyword Searching
              </h3>
              <p className="text-[#d9c6d1] text-base leading-relaxed">
                Traditional applicant tracking systems discard brilliant talent because of keyword mismatch.
                Talenta builds semantic knowledge graphs of engineering, product, and leadership skills,
                measuring problem-solving complexity rather than buzzword density.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bright/50 border border-white/5">
                  <Search className="w-5 h-5 text-[#FA1E71] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Semantic Discovery</h4>
                    <p className="text-xs text-[#d9c6d1] mt-1">Cross-references GitHub, publications, and patents.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-bright/50 border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-[#FA1E71] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Blind Equity Scoring</h4>
                    <p className="text-xs text-[#d9c6d1] mt-1">Anonymizes demographic markers to eliminate bias.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-[#110009] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="text-xs text-[#d9c6d1] ml-2 font-mono">Talenta Neural Engine v4.2</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#FA1E71]/20 text-[#FA1E71] px-2 py-0.5 rounded">
                    LIVE STREAM
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-[#d9c6d1]">
                    <span>Target Role:</span>
                    <span className="text-white font-semibold">Lead Full-Stack AI Engineer</span>
                  </div>
                  <div className="flex justify-between text-[#d9c6d1]">
                    <span>Semantic Profile Scanned:</span>
                    <span className="text-[#ff4d94]">8,420 candidates</span>
                  </div>
                  <div className="p-3 bg-surface-card rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-white">
                      <span className="font-sans font-bold">Top Neural Match: Sarah Lin</span>
                      <span className="text-[#FA1E71] font-bold">98.4% Match</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#FA1E71] h-full rounded-full" style={{ width: '98.4%' }} />
                    </div>
                    <p className="text-[11px] text-[#d9c6d1] font-sans">
                      Verified expertise in React 19, TypeScript, Vector DBs & LLM orchestration. 6 yrs velocity index: Tier 1.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
