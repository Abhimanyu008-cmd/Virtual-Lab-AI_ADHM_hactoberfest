/**
 * VirtuLab AI - Instrument Panel & Live Oscilloscope / Graph
 * Displays digital multimeter readouts, status telemetry,
 * and live Recharts graph for V-I curves or RC transient dynamics.
 */

import React, { useState, useEffect } from 'react';
import { SimulationReadings, CircuitStatus } from '../../types/circuit';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Power, Play, Pause, RotateCcw, Activity, Zap, Gauge, Sliders } from 'lucide-react';

interface InstrumentPanelProps {
  readings: SimulationReadings;
  powerSupplyOn: boolean;
  onTogglePower: () => void;
  onResetCircuit: () => void;
  experimentId: string;
  rcTimeSeconds: number;
  onUpdateRcTime: (t: number) => void;
  isPlayingRc: boolean;
  onTogglePlayRc: () => void;
}

export const InstrumentPanel: React.FC<InstrumentPanelProps> = ({
  readings,
  powerSupplyOn,
  onTogglePower,
  onResetCircuit,
  experimentId,
  rcTimeSeconds,
  onUpdateRcTime,
  isPlayingRc,
  onTogglePlayRc
}) => {
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [historicalData, setHistoricalData] = useState<Array<{ v: number; i: number; r: number }>>([]);

  // Accumulate Ohm's law measurement history whenever voltage changes in valid state
  useEffect(() => {
    if (powerSupplyOn && readings.status === 'VALID' && readings.sourceVoltage > 0) {
      setHistoricalData(prev => {
        const v = parseFloat(readings.sourceVoltage.toFixed(1));
        const i_mA = parseFloat((readings.totalCurrent * 1000).toFixed(1));
        const exists = prev.some(p => p.v === v);
        if (!exists) {
          const updated = [...prev, { v, i: i_mA, r: parseFloat(readings.totalResistance.toFixed(1)) }];
          return updated.sort((a, b) => a.v - b.v);
        }
        return prev;
      });
    }
  }, [readings.sourceVoltage, readings.totalCurrent, readings.status, powerSupplyOn, readings.totalResistance]);

  // Reset historical readings when circuit is reset
  const handleFullReset = () => {
    setHistoricalData([]);
    onResetCircuit();
  };

  const getStatusBadge = (status: CircuitStatus) => {
    switch (status) {
      case 'VALID':
        return { label: 'STEADY STATE · ACTIVE', color: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' };
      case 'POWER_OFF':
        return { label: 'DC SUPPLY OFF', color: 'bg-slate-900 border-slate-700 text-slate-400' };
      case 'SHORT_CIRCUIT':
        return { label: 'CRITICAL: SHORT CIRCUIT', color: 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' };
      case 'INCOMPLETE':
        return { label: 'OPEN / INCOMPLETE LOOP', color: 'bg-amber-950/80 border-amber-500/60 text-amber-300' };
      default:
        return { label: status, color: 'bg-slate-800 border-slate-600 text-slate-300' };
    }
  };

  const statusBadge = getStatusBadge(readings.status);

  return (
    <div className="bg-[#0b1222] border border-[#1e2e4f] rounded-xl p-3.5 flex flex-col gap-3.5">
      {/* 1. Instrument Header & Power Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#1e2e4f]/70">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">Benchtop Instrumentation Rack</h3>
            <div className="text-[10px] text-slate-400">Digital Precision Multimeter & Waveform Scope</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePower}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              powerSupplyOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 ring-1 ring-emerald-400'
                : 'bg-rose-700 hover:bg-rose-600 text-white shadow-rose-950/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{powerSupplyOn ? 'POWER ON' : 'POWER OFF'}</span>
          </button>

          <button
            onClick={handleFullReset}
            className="px-2.5 py-1.5 rounded-lg bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            title="Reset circuit to default wiring"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Status Telemetry Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#070b14] border border-[#1e2e4f] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Loop Status:</span>
          <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          {readings.status === 'VALID' ? 'Deterministic Equations Applied' : readings.statusMessage.slice(0, 48) + '...'}
        </div>
      </div>

      {/* 3. Seven-Segment Style Digital Multimeter Displays */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Voltage Readout */}
        <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>VOLTAGE (V)</span>
            <span className="text-amber-400 font-mono text-[10px]">DC RMS</span>
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-amber-400 tracking-wider">
            {powerSupplyOn ? readings.sourceVoltage.toFixed(2) : '0.00'}
            <span className="text-xs text-amber-500/70 ml-1">V</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Potential Difference</div>
        </div>

        {/* Current Readout */}
        <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>CURRENT (I)</span>
            <span className="text-cyan-400 font-mono text-[10px]">mA / A</span>
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-cyan-400 tracking-wider">
            {powerSupplyOn
              ? readings.totalCurrent >= 1
                ? readings.totalCurrent.toFixed(3)
                : (readings.totalCurrent * 1000).toFixed(1)
              : '0.0'}
            <span className="text-xs text-cyan-500/70 ml-1">
              {readings.totalCurrent >= 1 ? 'A' : 'mA'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Charge Drift Rate</div>
        </div>

        {/* Resistance Readout */}
        <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>RESISTANCE (Req)</span>
            <span className="text-emerald-400 font-mono text-[10px]">OHMS</span>
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-emerald-400 tracking-wider">
            {readings.totalResistance >= 1000
              ? (readings.totalResistance / 1000).toFixed(2)
              : readings.totalResistance.toFixed(1)}
            <span className="text-xs text-emerald-500/70 ml-1">
              {readings.totalResistance >= 1000 ? 'kΩ' : 'Ω'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Equivalent Impedance</div>
        </div>

        {/* Power Readout */}
        <div className="bg-[#070b14] border border-[#1e2e4f] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>POWER (P)</span>
            <span className="text-rose-400 font-mono text-[10px]">J/s</span>
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-rose-400 tracking-wider">
            {powerSupplyOn
              ? readings.totalPower >= 1
                ? readings.totalPower.toFixed(2)
                : (readings.totalPower * 1000).toFixed(1)
              : '0.0'}
            <span className="text-xs text-rose-500/70 ml-1">
              {readings.totalPower >= 1 ? 'W' : 'mW'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Thermal Dissipation</div>
        </div>
      </div>

      {/* 4. Live Graph Visualizer */}
      <div className="bg-[#070b14] border border-[#1e2e4f] rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1e2e4f]/60 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {experimentId === 'rc-transient'
                ? 'RC Transient Waveform (Vc vs Time)'
                : 'V–I Characteristic Graph (Ohm’s Law Verification)'}
            </span>
          </div>

          {/* RC Playback Controls if RC experiment */}
          {experimentId === 'rc-transient' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlayRc}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  isPlayingRc
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {isPlayingRc ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlayingRc ? 'Pause' : 'Start'}</span>
              </button>

              <button
                onClick={() => onUpdateRcTime(0)}
                className="p-1 rounded bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-slate-300"
                title="Reset transient time to t=0"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <span className="font-mono text-cyan-300 text-xs">t = {rcTimeSeconds.toFixed(2)}s</span>
            </div>
          )}
        </div>

        {/* Chart Rendering */}
        <div className="h-44 w-full">
          {experimentId === 'rc-transient' && readings.rcTransient ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readings.rcTransient.dataPoints} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} unit="s" />
                <YAxis stroke="#64748b" fontSize={10} unit="V" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e2e4f', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  name="Capacitor Vc (V)"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Charging I (mA)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  historicalData.length > 0
                    ? historicalData
                    : [
                        { v: 0, i: 0, r: 100 },
                        { v: 2, i: 20, r: 100 },
                        { v: 4, i: 40, r: 100 },
                        { v: 6, i: 60, r: 100 },
                        { v: 8, i: 80, r: 100 },
                        { v: 10, i: 100, r: 100 }
                      ]
                }
                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4f" />
                <XAxis
                  dataKey="v"
                  stroke="#64748b"
                  fontSize={10}
                  label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  label={{ value: 'Current (mA)', angle: -90, position: 'insideLeft', offset: 18, fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e2e4f', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} mA`, 'Current']}
                  labelFormatter={(lbl) => `Voltage: ${lbl} V`}
                />
                <Line
                  type="linear"
                  dataKey="i"
                  name="Measured Current (mA)"
                  stroke="#00f0ff"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#00f0ff' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
