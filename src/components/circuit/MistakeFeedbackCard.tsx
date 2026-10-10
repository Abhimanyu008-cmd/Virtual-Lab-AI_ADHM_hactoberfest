/**
 * VirtuLab AI - 5-Part Mistake Feedback Panel
 * Formatted structured diagnostic feedback for circuit errors.
 */

import React from 'react';
import { MistakeDiagnostic } from '../../types/circuit';
import { AlertTriangle, CheckCircle, HelpCircle, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';

interface MistakeFeedbackCardProps {
  diagnostics: MistakeDiagnostic[];
  onAskMentorAboutMistake?: (diagnostic: MistakeDiagnostic) => void;
}

export const MistakeFeedbackCard: React.FC<MistakeFeedbackCardProps> = ({
  diagnostics,
  onAskMentorAboutMistake
}) => {
  if (diagnostics.length === 0) {
    return (
      <div className="bg-[#0b1222] border border-emerald-900/40 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-emerald-200">No Electrical Mistakes Detected</div>
            <div className="text-[11px] text-emerald-400/80">Circuit topology complies with electrical laws and experiment rules.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1222] border border-amber-900/50 rounded-xl p-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#1e2e4f]/70 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-amber-200">
            Mistake Diagnostics & Procedure Feedback ({diagnostics.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Rule-Based Analysis</span>
      </div>

      <div className="flex flex-col gap-3">
        {diagnostics.map(diag => {
          const isCritical = diag.severity === 'critical';
          return (
            <div
              key={diag.id}
              className={`rounded-lg border p-3 flex flex-col gap-2.5 text-xs ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : 'bg-amber-950/20 border-amber-800/60'
              }`}
            >
              {/* Top Banner: Category and What */}
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-400'}`} />
                  <span>1. What is incorrect:</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  [{diag.category}]
                </span>
              </div>
              <p className="text-slate-200 pl-3.5 text-xs leading-relaxed font-medium">
                {diag.what}
              </p>

              {/* 5-Part Structured Matrix */}
              <div className="grid grid-cols-1 gap-2 pl-3.5 pt-1 border-t border-[#1e2e4f]/40 text-[11px]">
                {/* 2. Where */}
                <div>
                  <span className="font-semibold text-cyan-400">2. Where is the problem: </span>
                  <span className="text-slate-300 font-mono">{diag.where}</span>
                </div>

                {/* 3. Why */}
                <div>
                  <span className="font-semibold text-rose-300">3. Why does it matter: </span>
                  <span className="text-slate-300">{diag.why}</span>
                </div>

                {/* 4. Action */}
                <div>
                  <span className="font-semibold text-emerald-400">4. What should you do next: </span>
                  <span className="text-slate-200 font-medium">{diag.action}</span>
                </div>

                {/* 5. Concept */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>5. Concept to revise: <strong>{diag.concept}</strong></span>
                  </div>

                  {onAskMentorAboutMistake && (
                    <button
                      onClick={() => onAskMentorAboutMistake(diag)}
                      className="px-2.5 py-1 rounded bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] hover:border-cyan-500/50 text-[11px] text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Ask Lab Mentor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
