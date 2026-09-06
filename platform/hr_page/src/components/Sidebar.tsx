import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  Cpu, 
  Users, 
  Database, 
  Plus, 
  Settings, 
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { NavigationTab } from '../types';
import hrLogo from '../assets/images/hr_logo_redesign_1787557669398.jpg';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onDeployAgentClick: () => void;
  pendingReviewCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onDeployAgentClick,
  pendingReviewCount
}) => {
  const navItems = [
    { id: 'agents' as NavigationTab, label: 'HR Agents', icon: Bot },
    { id: 'chat' as NavigationTab, label: 'HR Copilot', icon: MessageSquare },
    { id: 'runs' as NavigationTab, label: 'Pipeline Runs', icon: Cpu },
    { 
      id: 'review' as NavigationTab, 
      label: 'Human Review', 
      icon: Users,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined 
    },
    { id: 'knowledge' as NavigationTab, label: 'HR Knowledge', icon: Database },
  ];

  return (
    <aside className="w-[260px] lg:w-[280px] h-screen bg-[#240018] border-r border-[#3a0f2a] flex flex-col justify-between flex-shrink-0 select-none z-30">
      {/* Top Header / Logo Beside Text */}
      <div>
        <div className="p-4 px-5 flex items-center gap-3 border-b border-[#350b26]/80">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#fa1e71] to-[#420427] p-[1.5px] shadow-lg shadow-[#fa1e71]/25 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={hrLogo} 
              alt="HR Talent Suite Logo" 
              className="w-full h-full object-cover rounded-[9px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-[#fa1e71]/40 rounded-xl pointer-events-none" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-[15px] font-bold text-white tracking-tight leading-tight truncate">
              HR Talent Suite
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fa1e71] animate-pulse shrink-0" />
              <p className="text-[11px] text-[#fa1e71] font-semibold tracking-wide truncate">
                HR Workspace
              </p>
            </div>
          </div>
        </div>

        {/* HR Profile Badge */}
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#2d0420] border border-[#4a1638] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#fa1e71]/20 border border-[#fa1e71]/40 flex items-center justify-center text-[#fa1e71] shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate">HR Operations Specialist</p>
            <p className="text-[10px] text-[#e5bdc3]/70 truncate">Talent Acquisition & People</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#3a0f2a] text-white shadow-sm border border-[#532440]'
                    : 'text-[#e5bdc3]/80 hover:text-white hover:bg-[#350b26]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive
                        ? 'text-[#fa1e71]'
                        : 'text-[#ab888d] group-hover:text-[#ffd8e9]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-[#fa1e71] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Deploy Button & Settings */}
      <div className="p-4 space-y-3 border-t border-[#350b26]">
        <button
          onClick={onDeployAgentClick}
          className="w-full py-3 px-4 rounded-full bg-[#fa1e71] hover:bg-[#e01662] active:scale-[0.98] text-white font-semibold text-[14px] shadow-lg shadow-[#fa1e71]/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy HR Agent</span>
        </button>

        <div className="pt-2 space-y-1">
          <button
            onClick={() => onTabChange('agents')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] text-[#e5bdc3]/70 hover:text-white hover:bg-[#350b26]/50 transition-colors"
          >
            <Settings className="w-4 h-4 text-[#ab888d]" />
            <span>HR Preferences</span>
          </button>
          <button
            onClick={() => alert('HR AI Talent Copilot Support is 24/7 online for HR Teams.')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] text-[#e5bdc3]/70 hover:text-white hover:bg-[#350b26]/50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#ab888d]" />
            <span>HR Helpdesk</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
