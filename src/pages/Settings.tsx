/**
 * VirtuLab AI - Platform Settings & Ollama Connection Diagnostics
 * Configures local Ollama endpoint, model name, role switching,
 * and comprehensive Windows PowerShell local setup instructions.
 */

import React, { useState, useEffect } from 'react';
import {
  getOllamaConfig,
  saveOllamaConfig,
  checkOllamaConnection,
  DEFAULT_OLLAMA_CONFIG
} from '../services/ollamaService';
import { StorageService } from '../services/storageService';
import { OllamaConfig, OllamaStatus, UserProfile } from '../types/app';
import {
  Settings2,
  Bot,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  User,
  RotateCcw,
  Cpu,
  Layers
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [config, setConfig] = useState<OllamaConfig>(getOllamaConfig());
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(StorageService.getUserProfile());

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await checkOllamaConnection(config);
      setStatus(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveOllamaConfig(config);
    handleTestConnection();
  };

  const handleToggleRole = () => {
    StorageService.toggleRole();
    setProfile(StorageService.getUserProfile());
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demonstration attendance, viva history, and progress to factory defaults?')) {
      StorageService.resetAllDemoData();
      setProfile(StorageService.getUserProfile());
      alert('Demonstration dataset reset successfully.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-[#0d162d] border border-[#1e2e4f] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>System Configuration & Hardware Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-mono">Local AI Runtime</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-cyan-400" />
            <span>Platform Settings & AI Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Manage your local Ollama Gemma instance connection, configure hardware resource models, and test instructor demonstration permissions.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Testing Link...' : 'Test Connection'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Ollama Configuration Form & Diagnostics (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1e2e4f] pb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-semibold text-slate-200">Local Ollama Configuration</h3>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                status?.isConnected
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-400'
              }`}>
                {status?.isConnected ? '● Connected' : '○ Offline / Standby'}
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Ollama HTTP API Endpoint:</label>
                <input
                  type="text"
                  value={config.endpoint}
                  onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">Default local port is 11434</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Configured Model Name:</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="gemma3:4b"
                  className="bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Model Presets */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400">Quick Model Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['gemma3:4b', 'gemma:2b', 'gemma2:2b', 'gemma:7b'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setConfig({ ...config, model: m })}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                        config.model === m
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-[#070b14] border-[#1e2e4f] text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1e2e4f]">
                <button
                  type="button"
                  onClick={() => setConfig(DEFAULT_OLLAMA_CONFIG)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Save & Re-test
                </button>
              </div>
            </form>

            {/* Diagnostic Message */}
            {status && (
              <div className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                status.isConnected
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  {status.isConnected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{status.isConnected ? 'Connection Verified' : 'Connection Standby'}</span>
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  {status.isConnected
                    ? `Successfully connected to Ollama. Installed local models: ${status.availableModels.join(', ') || 'None found (run ollama pull ' + config.model + ')'}.`
                    : status.errorMessage || 'Cannot reach Ollama at configured endpoint.'}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo State Card */}
          <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-200 border-b border-[#1e2e4f] pb-2">
              User Profile & Role Privileges
            </h3>

            <div className="flex items-center justify-between text-xs bg-[#070b14] p-3 rounded-lg border border-[#1e2e4f]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
                  {profile.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{profile.name}</div>
                  <div className="text-[11px] text-slate-400">Roll: {profile.rollNumber} · {profile.batch}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#111c34] text-cyan-300 border border-[#1e2e4f]">
                  {profile.role}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleToggleRole}
                className="px-3 py-1.5 rounded-lg bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch to {profile.role === 'student' ? 'Instructor Mode' : 'Student Mode'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Records</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Windows PowerShell Setup Instructions (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3.5">
            <div className="flex items-center gap-2 border-b border-[#1e2e4f] pb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                Beginner Local Setup Guide (Windows PC)
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To run VirtuLab AI completely locally on your personal computer without paid cloud APIs, follow these step-by-step Windows PowerShell instructions:
            </p>

            {/* Step 1: Install Ollama */}
            <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-3 flex flex-col gap-2 text-xs">
              <span className="font-semibold text-cyan-300">1. Install Ollama for Windows</span>
              <p className="text-slate-400 text-[11px]">
                Download and run the official Windows installer from <code className="text-cyan-400 font-mono">https://ollama.com/download</code>. Ollama installs as a background service listening on port 11434.
              </p>
            </div>

            {/* Step 2: Choose and Run Gemma */}
            <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-3 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-300">2. Download & Run Gemma in PowerShell</span>
                <button
                  onClick={() => copyToClipboard(`ollama run ${config.model}`, 'run')}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                >
                  {copiedCmd === 'run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'run' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#0b1222] p-2 rounded border border-[#1e2e4f] font-mono text-[11px] text-cyan-400">
                ollama run {config.model}
              </div>
              <p className="text-slate-400 text-[11px]">
                Open Windows PowerShell and paste the command above. Ollama will download the model weights (one-time) and launch the local API.
              </p>
            </div>

            {/* Step 3: Hardware Compatibility Note */}
            <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-3 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Hardware Memory Recommendations</span>
              </div>
              <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
                <li><strong className="text-slate-200">8 GB RAM or Laptop:</strong> Use <code className="text-cyan-400 font-mono">ollama run gemma:2b</code> (requires ~1.8 GB memory).</li>
                <li><strong className="text-slate-200">16 GB RAM or Dedicated GPU:</strong> Use <code className="text-cyan-400 font-mono">ollama run gemma3:4b</code> (default, ~3.3 GB memory).</li>
                <li><strong className="text-slate-200">32 GB RAM:</strong> Can comfortably run <code className="text-cyan-400 font-mono">ollama run gemma:7b</code>.</li>
              </ul>
            </div>

            {/* Step 4: Verify Local Model */}
            <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-3 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-300">3. Verify Installed Models</span>
                <button
                  onClick={() => copyToClipboard('ollama list', 'list')}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                >
                  {copiedCmd === 'list' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'list' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#0b1222] p-2 rounded border border-[#1e2e4f] font-mono text-[11px] text-cyan-400">
                ollama list
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
