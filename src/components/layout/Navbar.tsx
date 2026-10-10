/**
 * VirtuLab AI - Top Navigation Bar
 * Features page title, quick search, notification drawer,
 * AI connection status telemetry, and user profile switcher.
 */

import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../../services/storageService';
import { checkOllamaConnection, getOllamaConfig } from '../../services/ollamaService';
import { OllamaStatus, UserProfile, LabNotice } from '../../types/app';
import {
  Menu,
  Search,
  Bell,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenMobileSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  lab: 'Virtual Lab Workbench',
  attendance: 'My Attendance Tracker',
  updates: 'Live Lab Updates',
  notices: 'Notice Board',
  viva: 'AI Viva Coach',
  progress: 'My Progress & Analytics',
  settings: 'Settings & Diagnostics'
};

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileSidebar
}) => {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const notices: LabNotice[] = StorageService.getNotices();
  const config = getOllamaConfig();

  useEffect(() => {
    checkOllamaConnection(config).then(setOllamaStatus);
  }, []);

  const handleToggleRole = () => {
    StorageService.toggleRole();
    setProfile(StorageService.getUserProfile());
    setShowProfileMenu(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('ohm') || q.includes('resistor') || q.includes('circuit') || q.includes('lab')) {
      onNavigate('lab');
    } else if (q.includes('viva') || q.includes('oral') || q.includes('exam')) {
      onNavigate('viva');
    } else if (q.includes('attend') || q.includes('presence')) {
      onNavigate('attendance');
    } else {
      onNavigate('notices');
    }
    setSearchQuery('');
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-[#090e1b]/90 backdrop-blur-md border-b border-[#1e2e4f] sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-[#111c34] text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm md:text-base font-bold text-white tracking-tight">
            {PAGE_TITLES[currentPage] || 'VirtuLab AI'}
          </h2>
          <div className="text-[10px] text-slate-400 hidden sm:block">
            Engineering Laboratory Environment
          </div>
        </div>
      </div>

      {/* Center: Search input */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-full">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search experiments, notices, laws..."
          className="w-full bg-[#070b14] border border-[#1e2e4f] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Local AI Status Indicator */}
        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            ollamaStatus?.isConnected
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
              : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
          }`}
          title="Click to view Ollama diagnostics & setup guide"
        >
          <span className={`w-2 h-2 rounded-full ${ollamaStatus?.isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="hidden sm:inline">
            {ollamaStatus?.isConnected ? `Gemma (${config.model})` : 'Ollama Offline'}
          </span>
          <Bot className="w-3.5 h-3.5 sm:hidden" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-slate-300 hover:text-white relative transition-colors"
            title="Lab Notifications"
          >
            <Bell className="w-4 h-4" />
            {notices.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 ring-2 ring-[#090e1b]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0b1222] border border-[#1e2e4f] rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e2e4f]">
                <span className="font-semibold text-slate-200">Department Circulars</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#1e2e4f]/60 max-h-64 overflow-y-auto">
                {notices.slice(0, 4).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('notices');
                    }}
                    className="py-2 hover:bg-[#111c34] px-1 rounded cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-cyan-400">{n.category}</span>
                      <span>{n.datePosted}</span>
                    </div>
                    <div className="font-medium text-slate-200 mt-0.5 line-clamp-1">{n.title}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowNotifications(false);
                  onNavigate('notices');
                }}
                className="w-full mt-2 pt-2 border-t border-[#1e2e4f] text-center text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View Notice Board →
              </button>
            </div>
          )}
        </div>

        {/* Profile Menu & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-xs text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {profile.name[0]}
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-semibold leading-none">{profile.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{profile.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0b1222] border border-[#1e2e4f] rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="pb-2 border-b border-[#1e2e4f]">
                <div className="font-bold text-white">{profile.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">Roll: {profile.rollNumber}</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">{profile.batch}</div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={handleToggleRole}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#162546] text-slate-200 text-xs flex items-center justify-between"
                >
                  <span>Switch Role:</span>
                  <span className="font-mono text-cyan-400 font-semibold uppercase">
                    {profile.role === 'student' ? 'Instructor' : 'Student'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#162546] text-slate-200 text-xs"
                >
                  Settings & Setup Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
