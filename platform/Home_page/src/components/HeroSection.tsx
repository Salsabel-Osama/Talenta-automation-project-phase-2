import React from 'react';
import { Hero3D } from './Hero3D';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Users, BrainCircuit } from 'lucide-react';

interface HeroSectionProps {
  onExploreWorkspaces: () => void;
  onExplorePlatform: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreWorkspaces,
  onExplorePlatform,
}) => {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 pb-16 lg:py-0">
      {/* Hero Wave Background */}
      <div className="hero-wave-bg" aria-hidden="true">
        <div className="hex-pattern" />
        <svg preserveAspectRatio="none" viewBox="0 0 1440 900" className="w-full h-full">
          <defs>
            <linearGradient id="waveFade1" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4d94" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#1a0110" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="waveFade2" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#FA1E71" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a0110" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M1440,0 C1100,120 1250,320 900,420 C650,500 700,700 300,760 C100,800 0,700 -100,650 L1440,900 Z"
            fill="url(#waveFade1)"
          />
          <path
            d="M1440,0 C1200,60 1300,220 1050,300 C820,370 880,540 560,600 C320,645 200,560 60,520 L-100,900 L1540,900 Z"
            fill="url(#waveFade2)"
          />
          <path
            d="M1440,100 C1150,180 1200,260 900,320 C640,370 660,470 380,520"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
          />
          <path
            d="M1440,180 C1180,250 1230,320 950,380 C700,430 720,520 460,570"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Radial ambient glow orbs */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#FA1E71] rounded-full mix-blend-screen filter blur-[140px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#ff4d94] rounded-full mix-blend-screen filter blur-[130px] opacity-10 pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 max-w-2xl">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08]">
              <span className="text-[#fdf4f8]">Smarter Recruitment.</span>
              <br />
              <span className="text-[#FA1E71] glow-text">Human Decisions.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-[#d9c6d1] mb-8 leading-relaxed max-w-xl">
              Talenta Partners amplifies your hiring pipeline with neural intelligence that maps skill trajectories,
              evaluates talent velocity, and filters noise — leaving the final strategic decisions to human intuition.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                type="button"
                onClick={onExploreWorkspaces}
                className="inline-flex justify-center items-center gap-2.5 bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(250,30,113,0.45)] hover:shadow-[0_0_35px_rgba(250,30,113,0.7)] active:scale-95"
              >
                <span>Choose Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onExplorePlatform}
                className="inline-flex justify-center items-center gap-2.5 bg-surface-bright/50 border border-white/20 hover:border-[#FA1E71]/60 hover:bg-surface-bright/80 text-[#fdf4f8] font-semibold px-7 py-4 rounded-xl transition-all duration-300 backdrop-blur-md active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-[#FA1E71]" />
                <span>Explore Ecosystem</span>
              </button>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#fdf4f8]">4.2x</div>
                <div className="text-xs text-[#d9c6d1] mt-0.5">Faster Shortlisting</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#FA1E71]">96.8%</div>
                <div className="text-xs text-[#d9c6d1] mt-0.5">Match Precision</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#fdf4f8]">0%</div>
                <div className="text-xs text-[#d9c6d1] mt-0.5">Keyword Bias</div>
              </div>
            </div>
          </div>

          {/* Right Side 3D Interactive Matrix Column (Strictly on the Right) */}
          <div className="lg:col-span-5 w-full h-[400px] sm:h-[460px] lg:h-[540px] relative flex items-center justify-center">
            <div className="w-full h-full relative rounded-3xl overflow-hidden">
              <Hero3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
