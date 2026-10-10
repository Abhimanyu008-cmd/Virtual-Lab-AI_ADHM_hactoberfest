/**
 * VirtuLab AI - Deterministic Circuit Simulation Engine
 * Calculates physical circuit quantities using electrical engineering principles.
 * Does NOT hallucinate readings or use AI models to guess numbers.
 */

import { CircuitComponent, Wire, SimulationReadings, CircuitStatus, MistakeDiagnostic } from '../types/circuit';
import { runMistakeDetection } from './mistakeDetector';

export interface TopologyAnalysis {
  status: CircuitStatus;
  statusMessage: string;
  sourceVoltage: number;
  totalResistance: number;
  totalCurrent: number;
  totalPower: number;
  componentVoltages: Record<string, number>;
  componentCurrents: Record<string, number>;
  componentPowers: Record<string, number>;
  isShortCircuit: boolean;
  isOpenCircuit: boolean;
  isSwitchOpen: boolean;
  activeResistors: CircuitComponent[];
  isSeries: boolean;
  isParallel: boolean;
  diagnostics: MistakeDiagnostic[];
}

/**
 * Union-Find / Disjoint Set Data Structure to group terminals into electrical nets
 */
class UnionFind {
  parent: Map<string, string> = new Map();

  find(id: string): string {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
    }
    const p = this.parent.get(id)!;
    if (p !== id) {
      const root = this.find(p);
      this.parent.set(id, root);
      return root;
    }
    return p;
  }

  union(idA: string, idB: string): void {
    const rootA = this.find(idA);
    const rootB = this.find(idB);
    if (rootA !== rootB) {
      this.parent.set(rootA, rootB);
    }
  }

  connected(idA: string, idB: string): boolean {
    return this.find(idA) === this.find(idB);
  }
}

/**
 * Solves circuit electrical parameters based on physical graph topology
 */
export function simulateCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  powerSupplyOn: boolean = true,
  experimentId: string = 'ohms-law',
  rcTimeSeconds: number = 0
): SimulationReadings {
  // 1. Check Power Supply State
  if (!powerSupplyOn) {
    const diagnostics: MistakeDiagnostic[] = [];
    return {
      status: 'POWER_OFF',
      statusMessage: 'DC Power Supply is turned OFF. Switch on the main supply to energize the circuit.',
      sourceVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      componentVoltages: {},
      componentCurrents: {},
      componentPowers: {},
      diagnostics
    };
  }

  // 2. Identify core components
  const dcSources = components.filter(c => c.type === 'DC_SOURCE');
  const resistors = components.filter(c => c.type === 'RESISTOR');
  const switches = components.filter(c => c.type === 'SWITCH');
  const grounds = components.filter(c => c.type === 'GROUND');
  const capacitors = components.filter(c => c.type === 'CAPACITOR');
  const ammeters = components.filter(c => c.type === 'AMMETER');
  const voltmeters = components.filter(c => c.type === 'VOLTMETER');

  // No power source placed
  if (dcSources.length === 0) {
    return {
      status: 'INCOMPLETE',
      statusMessage: 'No DC Voltage Source in workspace. Place a DC Power Supply to power the circuit.',
      sourceVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      componentVoltages: {},
      componentCurrents: {},
      componentPowers: {},
      diagnostics: [{
        id: 'diag-no-source',
        code: 'ERR_NO_SOURCE',
        category: 'CONNECTION',
        what: 'Power supply is missing from the workspace.',
        where: 'Circuit workspace',
        why: 'An electrical circuit requires a potential difference source to drive charge carriers (electrons).',
        action: 'Drag and drop a DC Voltage Source onto the workspace.',
        concept: 'Electromotive Force (EMF) & Potential Difference',
        severity: 'critical',
        timestamp: Date.now()
      }]
    };
  }

  const dcSource = dcSources[0];
  const sourceVoltage = Math.max(0, dcSource.properties.voltage ?? 10);
  const posTerminal = dcSource.terminals.find(t => t.name === 'pos')?.id;
  const negTerminal = dcSource.terminals.find(t => t.name === 'neg')?.id;

  if (!posTerminal || !negTerminal) {
    return createEmptyReading('INVALID', 'DC Source has corrupted terminal definitions.');
  }

  // Build terminal net connectivity
  const uf = new UnionFind();

  // Wires connect terminals directly
  for (const wire of wires) {
    uf.union(wire.fromTerminalId, wire.toTerminalId);
  }

  // Closed switches bridge their terminal A and B with ~0 resistance
  let hasOpenSwitchInPath = false;
  for (const sw of switches) {
    const termA = sw.terminals.find(t => t.name === 'A')?.id;
    const termB = sw.terminals.find(t => t.name === 'B')?.id;
    if (termA && termB) {
      if (sw.properties.closed) {
        uf.union(termA, termB);
      } else {
        hasOpenSwitchInPath = true;
      }
    }
  }

  // Ammeters behave as ideal short circuits (0 resistance) for network node connection
  for (const am of ammeters) {
    const termPos = am.terminals.find(t => t.name === 'pos')?.id;
    const termNeg = am.terminals.find(t => t.name === 'neg')?.id;
    if (termPos && termNeg) {
      uf.union(termPos, termNeg);
    }
  }

  // Ground connection if present merges net with negative rail convention
  if (grounds.length > 0) {
    const gndTerm = grounds[0].terminals[0]?.id;
    if (gndTerm && uf.connected(gndTerm, negTerminal)) {
      // Ground properly tied to return rail
    }
  }

  // Check 1: Direct Short Circuit (Source Pos connected directly to Source Neg)
  if (uf.connected(posTerminal, negTerminal)) {
    return {
      status: 'SHORT_CIRCUIT',
      statusMessage: 'CRITICAL: Direct Short Circuit detected! Positive and Negative terminals are connected with zero load resistance.',
      sourceVoltage,
      totalCurrent: 999, // infinite / blown fuse representation
      totalResistance: 0,
      totalPower: 9999,
      componentVoltages: { [dcSource.id]: sourceVoltage },
      componentCurrents: { [dcSource.id]: 999 },
      componentPowers: { [dcSource.id]: 9999 },
      diagnostics: [{
        id: 'diag-short-circuit',
        code: 'ERR_SHORT_CIRCUIT',
        category: 'SHORT_CIRCUIT',
        what: 'A direct path with near-zero impedance exists between the power supply terminals.',
        where: `Between DC Source (+) [${posTerminal}] and (-) [${negTerminal}]`,
        why: 'According to Ohm\'s Law I = V/R, as R approaches 0, current I approaches infinity. In real hardware, this would trip circuit breakers, melt insulation, or destroy the power supply.',
        action: 'Remove the direct jumper wire and place a resistive load (resistor) between the terminals.',
        concept: 'Short Circuits and Overcurrent Protection (I = V / R as R → 0)',
        severity: 'critical',
        timestamp: Date.now()
      }]
    };
  }

  // Find resistors connected in the circuit
  // A resistor is connected if its terminal A and terminal B link to distinct nodes connected to the supply loop
  interface ConnectedResistor {
    component: CircuitComponent;
    termA: string;
    termB: string;
    netA: string;
    netB: string;
    resistance: number;
  }

  const connectedResistors: ConnectedResistor[] = [];
  for (const res of resistors) {
    const termA = res.terminals.find(t => t.name === 'A')?.id;
    const termB = res.terminals.find(t => t.name === 'B')?.id;
    const rVal = Math.max(0.1, res.properties.resistance ?? 100);
    if (termA && termB) {
      connectedResistors.push({
        component: res,
        termA,
        termB,
        netA: uf.find(termA),
        netB: uf.find(termB),
        resistance: rVal
      });
    }
  }

  const posNet = uf.find(posTerminal);
  const negNet = uf.find(negTerminal);

  // Check if any resistors are connected between posNet and negNet
  // Let's determine topology:
  // Is it Ohm's Law (single resistor), Series (chain of resistors), or Parallel (multiple resistors bridging posNet and negNet)?
  let totalResistance = 0;
  let totalCurrent = 0;
  let totalPower = 0;
  let circuitStatus: CircuitStatus = 'VALID';
  let statusMessage = 'Circuit energized and operating under normal steady-state conditions.';
  const componentVoltages: Record<string, number> = {};
  const componentCurrents: Record<string, number> = {};
  const componentPowers: Record<string, number> = {};

  // For RC Circuit experiment
  let rcTransientResult: SimulationReadings['rcTransient'] | undefined = undefined;

  // Check if capacitors exist and experiment is RC
  if (experimentId === 'rc-transient' && capacitors.length > 0) {
    const cap = capacitors[0];
    const capPos = cap.terminals.find(t => t.name === 'pos')?.id;
    const capNeg = cap.terminals.find(t => t.name === 'neg')?.id;
    const cVal = (cap.properties.capacitance ?? 100) * 1e-6; // convert uF to Farads

    // Look for resistor in series with capacitor
    const rInCircuit = connectedResistors.find(r => 
      (r.netA === posNet || r.netB === posNet)
    );
    const rVal = rInCircuit ? rInCircuit.resistance : 1000;
    const tau = Math.max(0.001, rVal * cVal); // Tau = R * C (seconds)

    // Calculate time-dependent RC response
    const t = Math.max(0, rcTimeSeconds);
    const vc = sourceVoltage * (1 - Math.exp(-t / tau));
    const ic = (sourceVoltage / rVal) * Math.exp(-t / tau);

    // Generate transient points for plotting
    const dataPoints: Array<{ time: number; voltage: number; current: number }> = [];
    const maxT = Math.max(10, tau * 5);
    const step = maxT / 50;
    for (let curT = 0; curT <= maxT; curT += step) {
      dataPoints.push({
        time: parseFloat(curT.toFixed(2)),
        voltage: parseFloat((sourceVoltage * (1 - Math.exp(-curT / tau))).toFixed(3)),
        current: parseFloat(((sourceVoltage / rVal) * Math.exp(-curT / tau) * 1000).toFixed(3)) // mA
      });
    }

    rcTransientResult = {
      time: t,
      capacitorVoltage: vc,
      chargingCurrent: ic,
      tau,
      isCharging: true,
      dataPoints
    };

    totalResistance = rVal;
    totalCurrent = ic;
    componentVoltages[cap.id] = vc;
    componentCurrents[cap.id] = ic;
    if (rInCircuit) {
      componentVoltages[rInCircuit.component.id] = sourceVoltage - vc;
      componentCurrents[rInCircuit.component.id] = ic;
    }
  } else {
    // Standard Resistive Network Analysis
    // 1. Identify which resistors are directly connected across posNet and negNet (Parallel branches)
    const directlyBridgedResistors = connectedResistors.filter(r => 
      (r.netA === posNet && r.netB === negNet) ||
      (r.netA === negNet && r.netB === posNet)
    );

    if (directlyBridgedResistors.length > 0 && directlyBridgedResistors.length === connectedResistors.length) {
      // Parallel Circuit (or Single Resistor if length == 1)
      let reciprocalSum = 0;
      for (const r of directlyBridgedResistors) {
        reciprocalSum += 1 / r.resistance;
      }
      totalResistance = 1 / reciprocalSum;
      totalCurrent = sourceVoltage / totalResistance;

      for (const r of directlyBridgedResistors) {
        const iBranch = sourceVoltage / r.resistance;
        const pBranch = sourceVoltage * iBranch;
        componentVoltages[r.component.id] = sourceVoltage;
        componentCurrents[r.component.id] = iBranch;
        componentPowers[r.component.id] = pBranch;
      }
    } else {
      // Check for Series Circuit: Resistors chained from posNet to negNet
      // Trace graph path from posNet to negNet through resistors
      const path = findResistorSeriesPath(posNet, negNet, connectedResistors);
      if (path && path.length > 0) {
        totalResistance = path.reduce((sum, r) => sum + r.resistance, 0);
        totalCurrent = sourceVoltage / totalResistance;

        for (const r of path) {
          const vDrop = totalCurrent * r.resistance;
          const pDrop = vDrop * totalCurrent;
          componentVoltages[r.component.id] = vDrop;
          componentCurrents[r.component.id] = totalCurrent;
          componentPowers[r.component.id] = pDrop;
        }
      } else {
        // Circuit is open / incomplete
        circuitStatus = 'INCOMPLETE';
        statusMessage = hasOpenSwitchInPath
          ? 'Circuit is incomplete because the switch is open. Close the switch to complete the conductive loop.'
          : 'Circuit is open (incomplete). Ensure there is a continuous closed loop from the DC (+) terminal through the resistors back to the (-) return terminal.';
        totalResistance = 0;
        totalCurrent = 0;
      }
    }
  }

  // Record power and meter voltages
  totalPower = sourceVoltage * totalCurrent;
  componentVoltages[dcSource.id] = sourceVoltage;
  componentCurrents[dcSource.id] = totalCurrent;
  componentPowers[dcSource.id] = totalPower;

  // Calculate Voltmeter & Ammeter readings
  for (const vm of voltmeters) {
    const tPos = vm.terminals.find(t => t.name === 'pos')?.id;
    const tNeg = vm.terminals.find(t => t.name === 'neg')?.id;
    if (tPos && tNeg) {
      const netVMPos = uf.find(tPos);
      const netVMNeg = uf.find(tNeg);
      if (netVMPos === posNet && netVMNeg === negNet) {
        componentVoltages[vm.id] = sourceVoltage;
      } else {
        // Measure across specific component if attached to its terminals
        let measuredV = 0;
        for (const r of connectedResistors) {
          if (
            (netVMPos === r.netA && netVMNeg === r.netB) ||
            (netVMPos === r.netB && netVMNeg === r.netA)
          ) {
            measuredV = componentVoltages[r.component.id] || 0;
          }
        }
        componentVoltages[vm.id] = measuredV;
      }
    }
  }

  for (const am of ammeters) {
    componentCurrents[am.id] = totalCurrent;
  }

  // 3. Run Rule-Based Mistake Detection
  const diagnostics = runMistakeDetection(
    components,
    wires,
    circuitStatus,
    experimentId,
    sourceVoltage,
    totalCurrent,
    totalResistance,
    connectedResistors.map(r => r.component),
    hasOpenSwitchInPath
  );

  return {
    status: circuitStatus,
    statusMessage,
    sourceVoltage,
    totalCurrent,
    totalResistance,
    totalPower,
    componentVoltages,
    componentCurrents,
    componentPowers,
    rcTransient: rcTransientResult,
    diagnostics
  };
}

/**
 * Finds a series path of resistors connecting startNet and endNet
 */
function findResistorSeriesPath(
  startNet: string,
  endNet: string,
  resistors: Array<{ component: CircuitComponent; netA: string; netB: string; resistance: number }>
): Array<{ component: CircuitComponent; resistance: number }> | null {
  const visitedResistors = new Set<string>();
  const path: Array<{ component: CircuitComponent; resistance: number }> = [];

  function dfs(currentNet: string): boolean {
    if (currentNet === endNet && path.length > 0) {
      return true;
    }

    for (const r of resistors) {
      if (visitedResistors.has(r.component.id)) continue;

      let nextNet: string | null = null;
      if (r.netA === currentNet) {
        nextNet = r.netB;
      } else if (r.netB === currentNet) {
        nextNet = r.netA;
      }

      if (nextNet !== null) {
        visitedResistors.add(r.component.id);
        path.push({ component: r.component, resistance: r.resistance });

        if (dfs(nextNet)) {
          return true;
        }

        path.pop();
        visitedResistors.delete(r.component.id);
      }
    }

    return false;
  }

  const success = dfs(startNet);
  return success ? path : null;
}

function createEmptyReading(status: CircuitStatus, message: string): SimulationReadings {
  return {
    status,
    statusMessage: message,
    sourceVoltage: 0,
    totalCurrent: 0,
    totalResistance: 0,
    totalPower: 0,
    componentVoltages: {},
    componentCurrents: {},
    componentPowers: {},
    diagnostics: []
  };
}
