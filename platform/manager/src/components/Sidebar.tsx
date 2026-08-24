import React from 'react';
import { 
  LayoutGrid, 
  Bot, 
  Database, 
  UserCheck, 
  Ticket, 
  Plus, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';
import { NavTab } from '../types';
import { HRLogo } from './HRLogo';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  failureCount: number;
  onOpenConnectMCP: () => void;
  onOpenFastAPI: () => void;
  onLogoutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  failureCount,
  onOpenConnectMCP,
  onOpenFastAPI,
  onLogoutClick,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      id: 'agents' as NavTab,
      label: 'Agents',
      icon: Bot,
    },
    {
      id: 'knowledge' as NavTab,
      label: 'Knowledge',
      icon: Database,
    },
    {
      id: 'human-review' as NavTab,
      label: 'Human Review',
      icon: UserCheck,
    },
    {
      id: 'failure-tickets' as NavTab,
      label: 'Failure Tickets',
      icon: Ticket,
      badge: failureCount > 0 ? failureCount : undefined,
    },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-72 bg-[#210217] border-r border-[#471536]/40 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0 z-30 select-none"
    >
      <div className="flex flex-col">
        {/* Logo & Brand Header */}
        <div id="brand-header" className="flex items-center gap-3.5 mb-10 pl-1">
          <HRLogo size="md" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none font-display">
              Manager Admin
            </h1>
            <p className="text-xs text-[#d49bb6] mt-1 tracking-wide font-normal font-sans">
              Enterprise Control
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav id="sidebar-navigation" className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#FA1E71] text-white font-medium shadow-md shadow-[#FA1E71]/25'
                    : 'text-[#e5bdc3]/80 hover:text-white hover:bg-[#3d0f2c]/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-[#e5bdc3]/70 group-hover:text-white'
                    }`} 
                  />
                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && (
                  <span 
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/25 text-white' 
                        : 'bg-[#ff9bb4]/20 text-[#ffafd8] border border-[#ff9bb4]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div id="sidebar-bottom-actions" className="flex flex-col gap-3 pt-4 border-t border-[#471536]/30">
        <button
          id="btn-fastapi-bridge"
          onClick={onOpenFastAPI}
          className="w-full py-2.5 px-4 bg-[#350b26] hover:bg-[#471a35] border border-[#61204A]/60 hover:border-[#FA1E71]/60 text-[#ffd8e9] rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FA1E71]" />
            <span>FastAPI & Python</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
        </button>

        <button
          id="btn-connect-mcp-sidebar"
          onClick={onOpenConnectMCP}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#FA1E71] to-[#e61763] hover:from-[#ff2e80] hover:to-[#FA1E71] text-white rounded-full text-xs font-semibold tracking-wide shadow-lg shadow-[#FA1E71]/30 hover:shadow-[#FA1E71]/45 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Connect MCP Server</span>
        </button>

        <button
          id="btn-logout-sidebar"
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-[#e5bdc3]/70 hover:text-white hover:bg-[#3d0f2c]/40 transition-colors text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
