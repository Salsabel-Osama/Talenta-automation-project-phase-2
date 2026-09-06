import React from 'react';
import { HeartHandshake, Eye, Lock, Award, Compass, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 relative bg-[#1a0110] z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FA1E71]/15 border border-[#FA1E71]/30 text-[#FA1E71] text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Our Guiding Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fdf4f8] tracking-tight leading-tight">
              Empowering Human Discernment with Machine Intelligence
            </h2>

            <p className="text-[#d9c6d1] text-base sm:text-lg leading-relaxed">
              At Talenta Partners, we reject the notion of replacing human recruiters with opaque, black-box algorithms.
              Recruitment is fundamentally about human connection, ambition, and potential.
            </p>

            <p className="text-[#d9c6d1] text-base sm:text-lg leading-relaxed">
              Our mission is to eliminate hundreds of hours wasted on tedious resume filtering and keyword gymnastics,
              providing decision-makers with rich, verified contextual dossiers so they can build world-class teams with absolute confidence.
            </p>

            <div className="pt-4 flex items-center gap-6">
              <div className="border-l-2 border-[#FA1E71] pl-4">
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-xs text-[#d9c6d1]">Explainable Recommendations</div>
              </div>
            </div>
          </div>

          {/* Right Ethical Pillars Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="ecosystem-card rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface-bright flex items-center justify-center text-[#FA1E71]">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Full Explainability</h3>
              <p className="text-xs text-[#d9c6d1] leading-relaxed">
                Every rating and ranking is fully deconstructed into tangible skill metrics and real-world project artifacts.
              </p>
            </div>

            <div className="ecosystem-card rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface-bright flex items-center justify-center text-[#FA1E71]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Data Sovereign Security</h3>
              <p className="text-xs text-[#d9c6d1] leading-relaxed">
                Candidate and enterprise data is encrypted end-to-end and never used to train public models without consent.
              </p>
            </div>

            <div className="ecosystem-card rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface-bright flex items-center justify-center text-[#FA1E71]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Bias-Free Architecture</h3>
              <p className="text-xs text-[#d9c6d1] leading-relaxed">
                Neutral assessment models strip away non-predictive demographic markers to guarantee equal opportunity.
              </p>
            </div>

            <div className="ecosystem-card rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface-bright flex items-center justify-center text-[#FA1E71]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Human Collaboration</h3>
              <p className="text-xs text-[#d9c6d1] leading-relaxed">
                AI proposes and prepares; talent acquisition leaders and hiring managers give the definitive green light.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
