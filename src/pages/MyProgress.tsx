/**
 * VirtuLab AI - My Progress & Learning Analytics
 * Derives performance metrics, mistake category distributions,
 * and recommendations from actual stored student attempts.
 */

import React from 'react';
import { StorageService } from '../services/storageService';
import { EXPERIMENTS } from '../data/experiments';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

interface MyProgressProps {
  onNavigate: (page: string) => void;
}

export const MyProgress: React.FC<MyProgressProps> = ({ onNavigate }) => {
  const attempts = StorageService.getAttempts();
  const vivaSessions = StorageService.getVivaSessions();

  const completedAttempts = attempts.filter(a => a.isCompleted);
  const totalCompleted = completedAttempts.length;

  // Compute mistake category distribution from attempts
  const totalMistakesLogged = attempts.reduce((acc, a) => acc + a.mistakesCount, 0);
  const totalCorrected = attempts.reduce((acc, a) => acc + a.correctedMistakesCount, 0);
  const accuracyPct = attempts.length > 0
    ? Math.round((totalCorrected / Math.max(1, totalMistakesLogged + totalCorrected)) * 100)
    : 100;

  // Compute average viva score
  const avgViva = vivaSessions.length > 0
    ? (vivaSessions.reduce((acc, v) => acc + v.averageScore, 0) / vivaSessions.length).toFixed(1)
    : 'N/A';

  // Bar chart data for experiment attempts vs mistakes
  const experimentPerformanceData = EXPERIMENTS.map(exp => {
    const expAttempts = attempts.filter(a => a.experimentId === exp.id);
    const mistakes = expAttempts.reduce((acc, a) => acc + a.mistakesCount, 0);
    const isDone = expAttempts.some(a => a.isCompleted);
    return {
      name: `Exp ${exp.number}`,
      fullName: exp.title,
      attempts: expAttempts.length,
      mistakes,
      completed: isDone ? 1 : 0
    };
  });

  // Trend data for viva scores over time
  const vivaTrendData = vivaSessions.map((v, idx) => ({
    session: `V${idx + 1}`,
    score: v.averageScore,
    topic: v.experimentTitle
  }));

  // Generate personalized recommendations based on actual history
  const recommendations: string[] = [];
  const highMistakeExp = experimentPerformanceData.find(e => e.mistakes >= 2);
  if (highMistakeExp) {
    recommendations.push(
      `You experienced multiple connection checks on "${highMistakeExp.fullName}". Revisit this experiment in Guided Procedure mode to reinforce circuit continuity.`
    );
  }

  const lowViva = vivaSessions.find(v => v.averageScore < 7);
  if (lowViva) {
    recommendations.push(
      `Your viva score for "${lowViva.experimentTitle}" had missing boundary assumptions. Practice viva questions at Intermediate difficulty.`
    );
  }

  if (completedAttempts.length < 3) {
    recommendations.push(
      `Complete Experiments 1 through 3 (Ohm's Law, Series, and Parallel circuits) to build solid fundamentals before attempting Kirchhoff's Laws.`
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-[#0d162d] border border-[#1e2e4f] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Student Learning Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-mono">Grounded Learning Analytics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <span>My Progress & Skill Analytics</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Performance metrics and mistake analysis derived strictly from your completed circuit simulations and viva exams.
          </p>
        </div>

        <button
          onClick={() => onNavigate('lab')}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all hover:scale-[1.02]"
        >
          <span>Practice Next Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Experiments Completed</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {totalCompleted} / {EXPERIMENTS.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {Math.round((totalCompleted / EXPERIMENTS.length) * 100)}% of total curriculum
          </div>
        </div>

        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Circuit Wiring Accuracy</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {accuracyPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalCorrected} errors rectified successfully
          </div>
        </div>

        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Simulation Attempts</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {attempts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Recorded laboratory runs
          </div>
        </div>

        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4">
          <div className="text-xs text-slate-400">Mean Viva Examination Score</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {avgViva} <span className="text-xs text-amber-500/70">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {vivaSessions.length} recorded oral sessions
          </div>
        </div>
      </div>

      {/* 3. Performance Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Experiment Attempts vs Mistakes Bar Chart */}
        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1e2e4f] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Experiment Attempts & Mistake Records
              </h3>
              <div className="text-[11px] text-slate-400">
                Visualizing student trials and wiring errors corrected
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">By Experiment</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experimentPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e2e4f', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="attempts" name="Total Runs" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mistakes" name="Mistakes Detected" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Viva Score Trend Line Chart */}
        <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1e2e4f] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Viva Examination Score Progress
              </h3>
              <div className="text-[11px] text-slate-400">
                Oral examination evaluation score trajectory
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">0–10 Scale</span>
          </div>

          <div className="h-56 w-full">
            {vivaTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vivaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" />
                  <XAxis dataKey="session" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e2e4f', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Viva Score"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No viva sessions recorded yet. Complete a viva to see your progress curve.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Actionable Personalized Recommendations */}
      <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-[#1e2e4f] pb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Actionable Recommendations for Academic Excellence
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#070b14] border border-[#1e2e4f]/80 text-xs text-slate-300 flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-[11px] font-bold">
                {idx + 1}
              </div>
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
