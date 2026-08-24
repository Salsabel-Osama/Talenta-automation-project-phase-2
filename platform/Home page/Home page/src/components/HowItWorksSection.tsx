import React from 'react';
import { WorkflowStep } from '../types';
import { Binary, GitMerge, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    stepNumber: '01',
    title: 'Autonomous Ingestion & Vectorization',
    description: 'Talenta Partners continuously indexes public engineering repos, verified project contributions, research patents, and historical velocity indicators into high-dimensional skill embeddings.',
    highlight: 'Zero Keyword Dependence',
    icon: 'Binary',
  },
  {
    stepNumber: '02',
    title: 'Neural Competency & Trajectory Scoring',
    description: 'Our proprietary evaluation model benchmarks problem-solving depth, architecture patterns, and learning speed against top 1% global engineering standards.',
    highlight: 'Contextual Problem Analysis',
    icon: 'GitMerge',
  },
  {
    stepNumber: '03',
    title: 'Human-Led Strategic Final Decisions',
    description: 'Recruiters and hiring managers receive comprehensive, explainable AI dossiers highlighting verified strengths, cultural compatibility signals, and interview questions.',
    highlight: '100% Human Final Authority',
    icon: 'UserCheck',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#2b031d] z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FA1E71]/15 border border-[#FA1E71]/30 text-[#FA1E71] text-xs font-semibold uppercase tracking-wider mb-4">
            Deterministic Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fdf4f8] mb-4 tracking-tight">
            How Talenta Partners Operates
          </h2>
          <p className="text-[#d9c6d1] text-base sm:text-lg leading-relaxed">
            From raw signal discovery to the final interview offer: an orchestrated journey
            where artificial intelligence handles exhaustive parsing and humans make the meaningful calls.
          </p>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {WORKFLOW_STEPS.map((step, idx) => (
            <div
              key={step.stepNumber}
              className="ecosystem-card rounded-3xl p-8 flex flex-col relative group border border-white/10"
            >
              {/* Step Marker Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-extrabold text-[#FA1E71] font-mono opacity-90">
                  {step.stepNumber}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FA1E71]/15 text-[#FA1E71] text-xs font-bold uppercase">
                  {step.highlight}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 leading-snug">
                {step.title}
              </h3>

              <p className="text-[#d9c6d1] text-sm leading-relaxed mb-6 flex-grow">
                {step.description}
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#FA1E71] font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Verified by Talenta Core</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
