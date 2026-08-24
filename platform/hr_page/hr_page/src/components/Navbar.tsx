import React from 'react';
import { Search } from 'lucide-react';
import { NavigationTab, ReviewItem } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onCreateRunClick?: () => void;
  reviewItems?: ReviewItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="h-[70px] bg-[#2b031d]/90 backdrop-blur-md border-b border-[#3a0f2a] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#ab888d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates, roles, rubrics..."
            className="w-full bg-[#240018]/80 text-[13px] text-[#ffd8e9] placeholder-[#ab888d]/70 pl-9.5 pr-12 py-2 rounded-full border border-[#471a35] focus:outline-none focus:border-[#fa1e71] focus:ring-1 focus:ring-[#fa1e71] transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-[#ab888d] bg-[#3a0f2a] rounded border border-[#532440] font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Top Views: Dashboard / Analytics */}
        <div className="flex items-center gap-1 bg-[#240018]/60 p-1 rounded-full border border-[#471a35]">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#3a0f2a] text-white shadow-sm font-semibold'
                : 'text-[#e5bdc3]/80 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              currentTab === 'analytics'
                ? 'bg-[#3a0f2a] text-white shadow-sm font-semibold'
                : 'text-[#e5bdc3]/80 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#240018] border border-[#471a35] text-[12px] font-medium text-[#ffd8e9]">
          <span className="w-2 h-2 rounded-full bg-[#fa1e71] animate-pulse" />
          <span className="text-[#e5bdc3]">Status:</span>
          <span className="text-white font-semibold">Online</span>
        </div>
      </div>
    </header>
  );
};
