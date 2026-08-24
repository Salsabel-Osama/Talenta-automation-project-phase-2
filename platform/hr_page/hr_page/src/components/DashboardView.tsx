import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Sparkles, 
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const kpis = [
    {
      title: 'Active Agent Runs',
      value: '18 Active',
      change: '+24% this week',
      isPositive: true,
      icon: Bot,
    },
    {
      title: 'Time-to-Candidate Match',
      value: '4.2 Minutes',
      change: '-78% vs manual sourcing',
      isPositive: true,
      icon: Clock,
    },
    {
      title: 'Average Match Precision',
      value: '94.8%',
      change: '+6.2% RAG calibration',
      isPositive: true,
      icon: Sparkles,
    },
    {
      title: 'Recruitment Cost Saved',
      value: '$340,000',
      change: '14 roles closed',
      isPositive: true,
      icon: DollarSign,
    },
  ];

  const skillDemand = [
    { skill: 'PyTorch / Distributed AI', demand: 94, supply: 'High Deficit' },
    { skill: 'Rust Systems & Libp2p', demand: 88, supply: 'Moderate' },
    { skill: 'CUDA Kernel Optimization', demand: 92, supply: 'High Deficit' },
    { skill: 'Zero-Knowledge ML', demand: 79, supply: 'Emerging' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2b031d] overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-[24px] font-bold text-white tracking-tight">
            HR Intelligence & Talent Telemetry
          </h2>
          <p className="text-[13px] text-[#e5bdc3]/80 mt-0.5">
            Enterprise analytics on autonomous sourcing velocity, budget adherence, and agent handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#350b26] border border-[#532440] text-[12px] text-[#ffd8e9] font-medium">
            Live Stream: Q3 2026
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#240018] border border-[#471a35] shadow-lg flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#ab888d]">
                  {kpi.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#350b26] flex items-center justify-center text-[#fa1e71]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-heading text-[24px] font-bold text-white tracking-tight">
                  {kpi.value}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline Funnel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#240018] border border-[#471a35] shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[16px] font-bold text-white">
              Autonomous Talent Conversion Funnel
            </h3>
            <span className="text-[12px] text-[#ab888d]">Last 30 Days</span>
          </div>

          {/* Funnel Progress Bars */}
          <div className="space-y-4">
            {[
              { stage: '1. Profiles Crawled & Scraped', count: '14,820 Candidates', percent: 100, color: '#ffb1c0' },
              { stage: '2. Vector RAG Alignment Score > 85%', count: '2,410 High Matches', percent: 74, color: '#ff809f' },
              { stage: '3. Human-in-the-Loop Approved', count: '482 Screened', percent: 45, color: '#fa1e71' },
              { stage: '4. Automated Outreach Accepted', count: '198 Interviews Scheduled', percent: 28, color: '#bd004e' },
            ].map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-white">{stage.stage}</span>
                  <span className="font-mono text-[#ffd8e9] font-semibold">{stage.count}</span>
                </div>
                <div className="w-full h-2.5 bg-[#350b26] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${stage.percent}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Market Scarcity Heatmap */}
        <div className="p-6 rounded-2xl bg-[#240018] border border-[#471a35] shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[16px] font-bold text-white">
              Skill Scarcity Index
            </h3>
            <span className="text-[12px] text-[#fa1e71] font-semibold">Live Q3</span>
          </div>

          <div className="space-y-3.5">
            {skillDemand.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#2b031d] border border-[#3a0f2a]">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="font-semibold text-white">{item.skill}</span>
                  <span className="text-[11px] font-bold text-[#fa1e71]">{item.supply}</span>
                </div>
                <div className="w-full h-1.5 bg-[#3a0f2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#fa1e71] rounded-full"
                    style={{ width: `${item.demand}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
