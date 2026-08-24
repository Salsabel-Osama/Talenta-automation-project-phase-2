import React from 'react';
import { ShieldCheck, Heart, Globe, Sparkles } from 'lucide-react';
import talentaLogo from '../assets/images/talenta_exact_logo_1787547708095.jpg';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-[#110009] border-t border-white/10 pt-16 pb-12 z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand and Mission Paragraph */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={talentaLogo}
                alt="Talenta Partners Logo"
                className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_0_12px_rgba(250,30,113,0.5)]"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-2xl tracking-tight text-white">Talenta Partners</span>
            </div>

            <p className="text-sm text-[#d9c6d1] leading-relaxed">
              Talenta Partners is an autonomous recruitment intelligence platform engineered to bridge deep computational skill evaluation with nuanced human leadership. We empower talent acquisition teams to uncover exceptional candidates based on verified capability and trajectory rather than resume formatting.
            </p>
          </div>

          {/* Narrative Overview / Ethical AI Pledge */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FA1E71]" />
              <span>Ethical AI & Governance Pledge</span>
            </h4>
            <p className="text-xs text-[#d9c6d1] leading-relaxed">
              Our neural matching models are continuously audited to eradicate bias. Candidate evaluations are generated transparently through mathematical competency vectors, ensuring every applicant receives fair, merit-first consideration.
            </p>
          </div>

          {/* Enterprise Support & Global Operations */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FA1E71]" />
              <span>Global Intelligence Network</span>
            </h4>
            <p className="text-xs text-[#d9c6d1] leading-relaxed">
              Serving tier-1 engineering organizations, high-growth technology ventures, and enterprise talent leaders across North America, Europe, the Middle East, and Asia-Pacific.
            </p>
          </div>
        </div>

        {/* Bottom Bar with Narrative Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#d9c6d1]">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Talenta Partners Recruitment Technologies Inc. All algorithmic decisions remain subject to human review.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <span>Built with precision for human-led hiring</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FA1E71]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
