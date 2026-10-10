/**
 * VirtuLab AI - Persistent Desktop Sidebar & Mobile Drawer
 * Provides high-contrast engineering instrument navigation across the 8 core sections.
 */

import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  CalendarCheck,
  Activity,
  Bell,
  GraduationCap,
  TrendingUp,
  Settings,
  Zap,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lab', label: 'Virtual Lab', icon: Cpu },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'updates', label: 'Live Lab Updates', icon: Activity },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'viva', label: 'AI Viva Coach', icon: GraduationCap },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#090e1b] border-r border-[#1e2e4f] z-50 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Wordmark Zone */}
          <div className="h-16 px-5 border-b border-[#1e2e4f] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-950/50">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>VirtuLab</span>
                <span className="text-cyan-400 font-mono text-xs">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Virtual Engineering Lab</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#111c34]/70 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-[#1e2e4f] text-[11px] text-slate-500 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Runtime:</span>
            <span className="font-mono text-cyan-400">Ollama Local</span>
          </div>
          <div className="text-[10px] text-slate-500">
            VirtuLab AI · Fall 2026 Academic Edition
          </div>
        </div>
      </aside>
    </>
  );
};
