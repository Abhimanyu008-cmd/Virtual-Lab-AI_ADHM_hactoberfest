/**
 * VirtuLab AI - Rule-Based Circuit Mistake Detection Engine
 * Inspects physical circuit connectivity, components, and experimental objectives.
 * Returns structured 5-part educational diagnostics.
 */

import { CircuitComponent, Wire, CircuitStatus, MistakeDiagnostic } from '../types/circuit';

export function runMistakeDetection(
  components: CircuitComponent[],
  wires: Wire[],
  circuitStatus: CircuitStatus,
  experimentId: string,
  sourceVoltage: number,
  totalCurrent: number,
  totalResistance: number,
  activeResistors: CircuitComponent[],
  isSwitchOpen: boolean
): MistakeDiagnostic[] {
  const diagnostics: MistakeDiagnostic[] = [];

  const dcSources = components.filter(c => c.type === 'DC_SOURCE');
  const resistors = components.filter(c => c.type === 'RESISTOR');
  const switches = components.filter(c => c.type === 'SWITCH');
  const ammeters = components.filter(c => c.type === 'AMMETER');
  const voltmeters = components.filter(c => c.type === 'VOLTMETER');
  const grounds = components.filter(c => c.type === 'GROUND');

  // Rule 1: No wires drawn at all
  if (wires.length === 0 && components.length > 1) {
    diagnostics.push({
      id: 'diag-unwired',
      code: 'ERR_NO_WIRES',
      category: 'OPEN_CIRCUIT',
      what: 'Components placed on the board are not connected by conductive wires.',
      where: 'Entire breadboard / workspace',
      why: 'Electric current requires continuous metallic conductors to transport free electrons across potential differences.',
      action: 'Click any terminal pin (e.g., DC Supply +) and click another component pin (e.g., Resistor A) to draw a connecting wire.',
      concept: 'Closed Electrical Loops & Conductive Pathways',
      severity: 'warning',
      timestamp: Date.now()
    });
    return diagnostics;
  }

  // Rule 2: Open Switch
  if (isSwitchOpen && switches.length > 0) {
    diagnostics.push({
      id: 'diag-open-switch',
      code: 'WARN_OPEN_SWITCH',
      category: 'OPEN_CIRCUIT',
      what: 'The circuit switch is currently in the OPEN position.',
      where: `Switch component [${switches[0].label}]`,
      why: 'An open switch introduces an infinite air gap resistance, breaking the loop and resulting in 0 A current flow.',
      action: 'Click the switch toggle to CLOSE the contacts.',
      concept: 'Switching Dynamics & Circuit Continuity',
      severity: 'warning',
      timestamp: Date.now()
    });
  }

  // Rule 3: Resistor terminal floating / unconnected
  for (const r of resistors) {
    const termA = r.terminals.find(t => t.name === 'A')?.id;
    const termB = r.terminals.find(t => t.name === 'B')?.id;
    const wiresOnA = wires.filter(w => w.fromTerminalId === termA || w.toTerminalId === termA);
    const wiresOnB = wires.filter(w => w.fromTerminalId === termB || w.toTerminalId === termB);

    if (wiresOnA.length === 0 && wiresOnB.length > 0) {
      diagnostics.push({
        id: `diag-floating-${r.id}-a`,
        code: 'ERR_FLOATING_TERMINAL',
        category: 'CONNECTION',
        what: `Resistor [${r.label}] terminal A is floating without any wire connection.`,
        where: `${r.label} - Terminal A`,
        why: 'Both terminals of a resistor must be connected to complete the conductive branch. A single connection leaves an open circuit.',
        action: `Connect a wire from ${r.label} Terminal A to the source or neighboring component.`,
        concept: 'Two-Terminal Passive Elements & Continuity',
        severity: 'critical',
        timestamp: Date.now()
      });
    } else if (wiresOnB.length === 0 && wiresOnA.length > 0) {
      diagnostics.push({
        id: `diag-floating-${r.id}-b`,
        code: 'ERR_FLOATING_TERMINAL',
        category: 'CONNECTION',
        what: `Resistor [${r.label}] terminal B is disconnected.`,
        where: `${r.label} - Terminal B`,
        why: 'Electric current cannot flow without a complete return path back to the reference ground or supply negative terminal.',
        action: `Connect a wire from ${r.label} Terminal B back to the negative rail or reference node.`,
        concept: 'Return Pathways and Closed Loops',
        severity: 'critical',
        timestamp: Date.now()
      });
    }
  }

  // Rule 4: Zero Resistance / Short Circuit
  if (circuitStatus === 'SHORT_CIRCUIT') {
    // Already flagged in simulation engine
  }

  // Rule 5: Negative or Zero Component Values
  for (const r of resistors) {
    const val = r.properties.resistance ?? 100;
    if (val <= 0) {
      diagnostics.push({
        id: `diag-invalid-val-${r.id}`,
        code: 'ERR_INVALID_RESISTANCE',
        category: 'VALUE',
        what: `Resistor [${r.label}] has an invalid resistance value of ${val} Ω.`,
        where: `${r.label} properties inspector`,
        why: 'Passive physical resistors must have strictly positive resistance (R > 0 Ω). Non-positive resistance violates thermodynamics for passive components.',
        action: `Set resistance to a standard E12/E24 positive value (e.g. 100 Ω, 220 Ω, 1 kΩ).`,
        concept: "Ohm's Law and Resistor Standard Ratings",
        severity: 'critical',
        timestamp: Date.now()
      });
    }
  }

  if (sourceVoltage <= 0 && dcSources.length > 0) {
    diagnostics.push({
      id: 'diag-zero-voltage',
      code: 'WARN_ZERO_VOLTAGE',
      category: 'VALUE',
      what: 'DC Voltage Source is configured to 0 V.',
      where: 'DC Power Supply controls',
      why: 'With 0 V potential difference, no electric field exists across the conductors to cause net drift velocity of electrons, so current is 0 A.',
      action: 'Increase the supply voltage slider to a test level such as 5 V, 10 V, or 12 V.',
      concept: 'Electric Potential Difference and Drift Velocity',
      severity: 'info',
      timestamp: Date.now()
    });
  }

  // Rule 6: Experiment-Specific Verification
  if (experimentId === 'ohms-law') {
    // For Ohm's Law, we expect 1 DC source and 1 primary resistor under test
    if (resistors.length === 0) {
      diagnostics.push({
        id: 'diag-ohm-no-resistor',
        code: 'ERR_OHM_NO_LOAD',
        category: 'CONNECTION',
        what: "Ohm's Law experiment requires a test resistor to investigate V = I·R.",
        where: 'Workspace load section',
        why: 'Ohm’s law establishes the linear relationship between voltage and current across a specific resistive load.',
        action: 'Add a Resistor from the component panel and connect it across the supply.',
        concept: "Ohm's Law (V = I·R)",
        severity: 'critical',
        timestamp: Date.now()
      });
    } else if (resistors.length > 1) {
      diagnostics.push({
        id: 'diag-ohm-multi-resistor',
        code: 'INFO_OHM_MULTI_LOAD',
        category: 'STEP_ORDER',
        what: "You have placed multiple resistors on the workspace for Ohm's Law.",
        where: 'Resistor bank',
        why: "The basic Ohm's Law verification is simplest with a single test resistor to plot a clean linear V vs. I slope.",
        action: 'Keep one resistor active or proceed to the Series/Parallel Resistor experiment.',
        concept: 'Independent Variables in Experimental Physics',
        severity: 'info',
        timestamp: Date.now()
      });
    }
  } else if (experimentId === 'series-circuit') {
    // Series experiment expects at least 2 resistors in a single daisy chain
    if (resistors.length < 2) {
      diagnostics.push({
        id: 'diag-series-need-two',
        code: 'ERR_SERIES_COUNT',
        category: 'CONNECTION',
        what: 'Series Resistor experiment requires at least 2 resistors connected in series.',
        where: 'Resistor chain',
        why: 'To verify Req = R1 + R2 and examine voltage division, at least two distinct resistive components are required.',
        action: 'Add a second resistor (R2) and connect it in series with R1.',
        concept: 'Series Resistance Law (R_total = R1 + R2 + ... + Rn)',
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  } else if (experimentId === 'parallel-circuit') {
    // Parallel experiment expects at least 2 resistors in parallel branches
    if (resistors.length < 2) {
      diagnostics.push({
        id: 'diag-parallel-need-two',
        code: 'ERR_PARALLEL_COUNT',
        category: 'CONNECTION',
        what: 'Parallel Resistor experiment requires at least 2 resistors connected across common voltage nodes.',
        where: 'Parallel branches',
        why: 'To verify 1/Req = 1/R1 + 1/R2 and examine current splitting, multiple parallel branches are needed.',
        action: 'Add a second resistor (R2) and connect its terminals in parallel with R1.',
        concept: 'Parallel Resistance & Kirchhoff\'s Current Law',
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  } else if (experimentId === 'voltage-divider') {
    if (resistors.length < 2) {
      diagnostics.push({
        id: 'diag-divider-need-two',
        code: 'ERR_DIVIDER_COUNT',
        category: 'CONNECTION',
        what: 'Voltage Divider requires two resistors (R1 upper and R2 lower/ground reference).',
        where: 'Resistor divider network',
        why: 'Output voltage Vout = Vin · (R2 / (R1 + R2)) requires two impedances in series.',
        action: 'Place two resistors in series across Vin and Ground, and tap Vout from the junction.',
        concept: 'Voltage Division Principle',
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  } else if (experimentId === 'rc-transient') {
    const caps = components.filter(c => c.type === 'CAPACITOR');
    if (caps.length === 0) {
      diagnostics.push({
        id: 'diag-rc-no-cap',
        code: 'ERR_RC_NO_CAP',
        category: 'CONNECTION',
        what: 'RC Transient experiment requires an electrolytic or ceramic Capacitor.',
        where: 'Workspace reactive component slot',
        why: 'Transient exponential charging/discharging cannot occur without an energy storage element (Capacitor).',
        action: 'Drag and place a Capacitor from the component library onto the board.',
        concept: 'Capacitive Storage and Time Constant Tau = R·C',
        severity: 'critical',
        timestamp: Date.now()
      });
    }
  }

  // Rule 7: Voltmeter connected in series check
  // If a voltmeter is wired directly in the main current loop instead of across a component
  for (const vm of voltmeters) {
    const tPos = vm.terminals.find(t => t.name === 'pos')?.id;
    const tNeg = vm.terminals.find(t => t.name === 'neg')?.id;
    // Check if voltmeter is wired like a series resistor
    const posWires = wires.filter(w => w.fromTerminalId === tPos || w.toTerminalId === tPos);
    const negWires = wires.filter(w => w.fromTerminalId === tNeg || w.toTerminalId === tNeg);
    if (posWires.length === 1 && negWires.length === 1 && resistors.length === 0) {
      diagnostics.push({
        id: `diag-vm-series-${vm.id}`,
        code: 'WARN_VOLTMETER_SERIES',
        category: 'INSTRUMENT',
        what: 'Voltmeter appears to be connected in series with the main loop.',
        where: `Voltmeter [${vm.label}]`,
        why: 'An ideal voltmeter has extremely high internal input impedance (~10 MΩ). Connecting it in series blocks almost all current.',
        action: 'Connect the Voltmeter in PARALLEL across the component you want to measure.',
        concept: 'Instrument Input Impedance & Parallel Voltage Measurement',
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  }

  // Rule 8: Ammeter connected in parallel across power supply (would cause dead short)
  for (const am of ammeters) {
    const tPos = am.terminals.find(t => t.name === 'pos')?.id;
    const tNeg = am.terminals.find(t => t.name === 'neg')?.id;
    const dcPos = dcSources[0]?.terminals.find(t => t.name === 'pos')?.id;
    const dcNeg = dcSources[0]?.terminals.find(t => t.name === 'neg')?.id;
    if (tPos && tNeg && dcPos && dcNeg) {
      const wiresDirectPos = wires.some(w => (w.fromTerminalId === tPos && w.toTerminalId === dcPos) || (w.fromTerminalId === dcPos && w.toTerminalId === tPos));
      const wiresDirectNeg = wires.some(w => (w.fromTerminalId === tNeg && w.toTerminalId === dcNeg) || (w.fromTerminalId === dcNeg && w.toTerminalId === tNeg));
      if (wiresDirectPos && wiresDirectNeg) {
        diagnostics.push({
          id: `diag-ammeter-parallel-${am.id}`,
          code: 'ERR_AMMETER_PARALLEL',
          category: 'INSTRUMENT',
          what: 'Ammeter is connected directly in parallel across the DC supply.',
          where: `Ammeter [${am.label}] across DC Source`,
          why: 'An ammeter has near-zero internal shunt resistance. Connecting it in parallel across a voltage source causes a catastrophic short circuit and burns the fuse.',
          action: 'Connect the Ammeter in SERIES with the circuit path, never in parallel across a voltage source.',
          concept: 'Ammeter Shunt Impedance and In-Line Current Measurement',
          severity: 'critical',
          timestamp: Date.now()
        });
      }
    }
  }

  return diagnostics;
}
