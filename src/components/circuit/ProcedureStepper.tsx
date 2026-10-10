/**
 * VirtuLab AI - Guided Step-by-Step Procedure Stepper
 * Enforces rigorous laboratory procedure with deterministic condition validation.
 * Prevents skipping steps without satisfying electrical and connection constraints.
 */

import React, { useState } from 'react';
import { ExperimentStep, CircuitComponent, Wire, SimulationReadings } from '../../types/circuit';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface ProcedureStepperProps {
  steps: ExperimentStep[];
  currentStepIndex: number;
  completedStepIndices: number[];
  components: CircuitComponent[];
  wires: Wire[];
  readings: SimulationReadings;
  onAdvanceStep: () => void;
  onSetStepIndex: (index: number) => void;
  onStepVerified: (index: number) => void;
}

export const ProcedureStepper: React.FC<ProcedureStepperProps> = ({
  steps,
  currentStepIndex,
  completedStepIndices,
  components,
  wires,
  readings,
  onAdvanceStep,
  onSetStepIndex,
  onStepVerified
}) => {
  const [showHint, setShowHint] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    passed: boolean;
    message: string;
  } | null>(null);

  const activeStep = steps[currentStepIndex];
  if (!activeStep) return null;

  const isCurrentStepCompleted = completedStepIndices.includes(currentStepIndex);

  const handleVerify = () => {
    try {
      const passed = activeStep.validator(components, wires, readings);
      if (passed) {
        setValidationResult({
          tested: true,
          passed: true,
          message: 'Step Verified! Electrical condition successfully satisfied.'
        });
        onStepVerified(currentStepIndex);
      } else {
        setValidationResult({
          tested: true,
          passed: false,
          message: `Target condition not met: "${activeStep.targetCondition}". Check connections or parameter values and retry.`
        });
      }
    } catch {
      setValidationResult({
        tested: true,
        passed: false,
        message: 'Validation could not verify the circuit state. Ensure components are connected.'
      });
    }
  };

  return (
    <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-3.5 flex flex-col gap-3">
      {/* Step header and pill-free progress */}
      <div className="flex items-center justify-between border-b border-[#1e2e4f]/70 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">Guided Laboratory Procedure</span>
          <span className="text-[11px] text-slate-500">·</span>
          <span className="text-xs font-mono text-cyan-400">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Step indicator buttons */}
        <div className="flex items-center gap-1.5">
          {steps.map((st, idx) => {
            const isDone = completedStepIndices.includes(idx);
            const isCur = idx === currentStepIndex;
            return (
              <button
                key={st.stepNumber}
                onClick={() => {
                  onSetStepIndex(idx);
                  setValidationResult(null);
                  setShowHint(false);
                }}
                className={`w-6 h-6 rounded-md text-xs font-mono font-semibold transition-all ${
                  isCur
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/50'
                    : isDone
                    ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-400'
                    : 'bg-[#111c34] border border-[#1e2e4f] text-slate-400 hover:text-white'
                }`}
                title={`Step ${idx + 1}: ${st.title}`}
              >
                {st.stepNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active step details */}
      <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-white">
            {activeStep.stepNumber}. {activeStep.title}
          </h4>
          {isCurrentStepCompleted && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 shrink-0 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {activeStep.description}
        </p>

        <div className="p-2 rounded bg-[#0b1222] border border-[#1e2e4f]/80 text-[11px] flex flex-col gap-1">
          <span className="font-semibold text-cyan-400">Target Condition:</span>
          <span className="text-slate-300 font-mono">{activeStep.targetCondition}</span>
        </div>

        {/* Hint drawer */}
        {showHint && (
          <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/50 text-[11px] text-cyan-200">
            <span className="font-semibold text-cyan-300">Lab Tip: </span>
            {activeStep.hint}
          </div>
        )}

        {/* Validation message */}
        {validationResult && (
          <div
            className={`p-2.5 rounded text-xs flex items-start gap-2 border ${
              validationResult.passed
                ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-200'
                : 'bg-rose-950/50 border-rose-600/50 text-rose-200'
            }`}
          >
            {validationResult.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-snug">{validationResult.message}</div>
          </div>
        )}
      </div>

      {/* Stepper bottom action buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Verify Step
          </button>

          {currentStepIndex < steps.length - 1 && (
            <button
              onClick={() => {
                if (isCurrentStepCompleted || validationResult?.passed) {
                  onAdvanceStep();
                  setValidationResult(null);
                  setShowHint(false);
                } else {
                  handleVerify();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                isCurrentStepCompleted || validationResult?.passed
                  ? 'bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-slate-200'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
