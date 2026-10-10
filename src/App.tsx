/**
 * VirtuLab AI - The Virtual Engineering Laboratory
 * Interactive electronics workbench, deterministic simulation engine,
 * rule-based mistake detection, and local Ollama Gemma AI Viva Coach.
 */

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { VirtualLab } from './pages/VirtualLab';
import { AttendanceTracker } from './pages/AttendanceTracker';
import { LiveLabUpdates } from './pages/LiveLabUpdates';
import { NoticeBoard } from './pages/NoticeBoard';
import { VivaCoach } from './pages/VivaCoach';
import { MyProgress } from './pages/MyProgress';
import { Settings } from './pages/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'lab':
        return <VirtualLab />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'updates':
        return <LiveLabUpdates />;
      case 'notices':
        return <NoticeBoard />;
      case 'viva':
        return <VivaCoach />;
      case 'progress':
        return <MyProgress onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Persistent Desktop Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
