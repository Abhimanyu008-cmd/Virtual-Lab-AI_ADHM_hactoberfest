/**
 * VirtuLab AI - Circuit and Simulation Types
 */

export type ComponentType = 
  | 'DC_SOURCE'
  | 'RESISTOR'
  | 'GROUND'
  | 'SWITCH'
  | 'AMMETER'
  | 'VOLTMETER'
  | 'CAPACITOR';

export interface Terminal {
  id: string;
  name: string; // e.g. 'pos', 'neg', 'A', 'B', 'gnd'
  componentId: string;
  relX: number; // relative to component center
  relY: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  label: string;
  x: number;
  y: number;
  rotation: number; // in degrees: 0, 90, 180, 270
  terminals: Terminal[];
  properties: {
    voltage?: number;       // for DC_SOURCE (Volts)
    resistance?: number;    // for RESISTOR (Ohms)
    capacitance?: number;   // for CAPACITOR (uF)
    closed?: boolean;       // for SWITCH
    mode?: 'V' | 'I' | 'R'; // for Multimeters
  };
}

export interface Wire {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
  color?: string;
}

export type CircuitStatus = 
  | 'POWER_OFF'
  | 'VALID'
  | 'INCOMPLETE'
  | 'INVALID'
  | 'SHORT_CIRCUIT'
  | 'UNSUPPORTED';

export interface MistakeDiagnostic {
  id: string;
  code: string;
  category: 'CONNECTION' | 'SHORT_CIRCUIT' | 'OPEN_CIRCUIT' | 'VALUE' | 'INSTRUMENT' | 'POLARITY' | 'STEP_ORDER';
  what: string;       // 1. What is incorrect?
  where: string;      // 2. Where is the problem?
  why: string;        // 3. Why does it matter?
  action: string;     // 4. What should the student do next?
  concept: string;    // 5. What concept should they revise?
  severity: 'critical' | 'warning' | 'info';
  timestamp: number;
}

export interface SimulationReadings {
  status: CircuitStatus;
  statusMessage: string;
  sourceVoltage: number;        // V
  totalCurrent: number;         // A
  totalResistance: number;      // Ohms
  totalPower: number;           // Watts
  componentVoltages: Record<string, number>; // componentId -> Voltage drop (V)
  componentCurrents: Record<string, number>; // componentId -> Current through (A)
  componentPowers: Record<string, number>;   // componentId -> Power dissipated (W)
  rcTransient?: {
    time: number;               // seconds elapsed
    capacitorVoltage: number;   // V
    chargingCurrent: number;    // A
    tau: number;                // R*C in seconds
    isCharging: boolean;
    dataPoints: Array<{ time: number; voltage: number; current: number }>;
  };
  diagnostics: MistakeDiagnostic[];
}

export interface ExperimentStep {
  stepNumber: number;
  title: string;
  description: string;
  targetCondition: string;
  hint: string;
  validator: (components: CircuitComponent[], wires: Wire[], readings: SimulationReadings) => boolean;
}

export interface ExperimentDefinition {
  id: string;
  number: number;
  title: string;
  category: 'Basic Electrical' | 'Analog Electronics';
  aim: string;
  theory: string;
  requiredApparatus: string[];
  circuitDiagramUrl?: string;
  schematicDescription: string;
  procedure: string[];
  expectedObservations: string;
  formulas: Array<{ name: string; formula: string; explanation: string }>;
  safetyNotes: string[];
  learningObjectives: string[];
  guidedSteps: ExperimentStep[];
  defaultComponents: CircuitComponent[];
  defaultWires: Wire[];
}
