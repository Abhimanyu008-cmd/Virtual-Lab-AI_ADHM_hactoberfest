/**
 * VirtuLab AI - Experiments Catalog & Guided Procedures
 * Contains rigorous educational curricula for electrical engineering experiments.
 */

import { ExperimentDefinition, CircuitComponent, Wire } from '../types/circuit';

export const EXPERIMENTS: ExperimentDefinition[] = [
  {
    id: 'ohms-law',
    number: 1,
    title: "Verification of Ohm's Law",
    category: 'Basic Electrical',
    aim: "To verify that the current passing through a metallic conductor is directly proportional to the potential difference across its terminals at constant temperature, and calculate resistance R = V / I.",
    theory: "Ohm's Law states that the current (I) flowing through a conductor between two points is directly proportional to the voltage (V) across the two points, provided physical conditions such as temperature remain constant: V = I × R, where R is the resistance in Ohms (Ω). Plotting Voltage (V) on the y-axis against Current (I) on the x-axis yields a straight line with slope equal to resistance R.",
    requiredApparatus: [
      "Regulated DC Power Supply (0–30V)",
      "Standard Fixed Resistor (100 Ω / 220 Ω, 0.5W)",
      "DC Digital Ammeter (0–500 mA)",
      "DC Digital Voltmeter (0–30 V)",
      "Single-Pole Single-Throw (SPST) Switch",
      "Conductive jumper wires and Breadboard"
    ],
    schematicDescription: "DC Source (+) connects through an SPST Switch to Ammeter (+) terminal. Ammeter (-) connects to Resistor Terminal A. Resistor Terminal B connects back to DC Source (-) and Ground. Voltmeter is connected in parallel across Resistor Terminals A and B.",
    procedure: [
      "1. Place a DC Power Supply, an SPST Switch, a 100 Ω Resistor, and connection wires on the workspace.",
      "2. Connect the positive terminal (+) of the DC supply to Switch terminal A.",
      "3. Connect Switch terminal B to Resistor terminal A.",
      "4. Complete the circuit loop by connecting Resistor terminal B to DC supply negative (-).",
      "5. Connect the digital voltmeter across the resistor terminals.",
      "6. Turn on the power supply, close the switch, and adjust voltage from 2V to 20V in steps of 2V.",
      "7. Record the corresponding current (I) for each voltage setting and verify that V/I equals the nominal resistance."
    ],
    expectedObservations: "As voltage increases linearly, current increases in exact direct proportion. The ratio V/I remains constant within measurement tolerances, proving Ohm's Law.",
    formulas: [
      { name: "Ohm's Law", formula: "V = I · R", explanation: "Voltage equals current multiplied by resistance" },
      { name: "Current Calculation", formula: "I = V / R", explanation: "Current is inversely proportional to resistance" },
      { name: "Power Dissipated", formula: "P = V · I = I² · R", explanation: "Rate of electrical energy converted into thermal heat" }
    ],
    safetyNotes: [
      "Ensure circuit power is switched OFF before altering wire connections.",
      "Do not exceed the resistor's continuous power rating (P = V²/R). For a 0.25W 100Ω resistor, maximum safe voltage is 5V.",
      "Never connect an ammeter directly across the voltage supply terminals."
    ],
    learningObjectives: [
      "Understand the physical relationship between electric potential, resistance, and charge drift.",
      "Learn correct in-line series wiring for current measurement and parallel wiring for voltage measurement.",
      "Analyze V-I linear characteristic graphs."
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Place Power Supply & Resistor",
        description: "Add a DC Voltage Source and a Resistor to the workspace.",
        targetCondition: "At least 1 DC Source and 1 Resistor placed.",
        hint: "Use the component palette on the left to add a DC Source and Resistor.",
        validator: (components) => {
          return components.some(c => c.type === 'DC_SOURCE') && components.some(c => c.type === 'RESISTOR');
        }
      },
      {
        stepNumber: 2,
        title: "Wire the Closed Circuit Loop",
        description: "Connect the DC Source (+) to Resistor Terminal A, and Resistor Terminal B to DC Source (-).",
        targetCondition: "Complete loop wired between DC supply and resistor.",
        hint: "Click DC Source (+) pin, then click Resistor A. Then click Resistor B, then DC Source (-).",
        validator: (_, __, readings) => {
          return readings.status === 'VALID' || (readings.status === 'POWER_OFF' && readings.totalResistance > 0);
        }
      },
      {
        stepNumber: 3,
        title: "Power On & Observe Current",
        description: "Switch ON the DC Power Supply and set voltage to 10 V. Verify that current equals V / R.",
        targetCondition: "Power Supply is ON, Voltage > 0 V, Current > 0 A.",
        hint: "Toggle the Power switch ON in the top instrument controls.",
        validator: (_, __, readings) => {
          return readings.status === 'VALID' && readings.sourceVoltage > 0 && readings.totalCurrent > 0;
        }
      },
      {
        stepNumber: 4,
        title: "Verify Linearity at Different Voltages",
        description: "Adjust the voltage slider to 15 V or 20 V and observe how current scales proportionally.",
        targetCondition: "Source voltage set to 15V or higher with valid current flow.",
        hint: "Slide the DC Source voltage control to 15 V or 20 V.",
        validator: (_, __, readings) => {
          return readings.status === 'VALID' && readings.sourceVoltage >= 14.5;
        }
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'DC Supply',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 10 }
      },
      {
        id: 'sw-1',
        type: 'SWITCH',
        label: 'Switch S1',
        x: 280,
        y: 120,
        rotation: 0,
        terminals: [
          { id: 'sw-a', name: 'A', componentId: 'sw-1', relX: -35, relY: 0 },
          { id: 'sw-b', name: 'B', componentId: 'sw-1', relX: 35, relY: 0 }
        ],
        properties: { closed: true }
      },
      {
        id: 'res-1',
        type: 'RESISTOR',
        label: 'Resistor R1 (100Ω)',
        x: 480,
        y: 200,
        rotation: 90,
        terminals: [
          { id: 'r1-a', name: 'A', componentId: 'res-1', relX: 0, relY: -45 },
          { id: 'r1-b', name: 'B', componentId: 'res-1', relX: 0, relY: 45 }
        ],
        properties: { resistance: 100 }
      },
      {
        id: 'gnd-1',
        type: 'GROUND',
        label: 'Ground',
        x: 300,
        y: 340,
        rotation: 0,
        terminals: [
          { id: 'gnd-term', name: 'gnd', componentId: 'gnd-1', relX: 0, relY: -20 }
        ],
        properties: {}
      }
    ],
    defaultWires: [
      { id: 'w1', fromTerminalId: 'dc-pos', toTerminalId: 'sw-a', color: '#f43f5e' },
      { id: 'w2', fromTerminalId: 'sw-b', toTerminalId: 'r1-a', color: '#f43f5e' },
      { id: 'w3', fromTerminalId: 'r1-b', toTerminalId: 'dc-neg', color: '#38bdf8' },
      { id: 'w4', fromTerminalId: 'dc-neg', toTerminalId: 'gnd-term', color: '#22c55e' }
    ]
  },
  {
    id: 'series-circuit',
    number: 2,
    title: "Series Resistor Network & Equivalent Resistance",
    category: 'Basic Electrical',
    aim: "To determine the equivalent resistance of resistors connected in series and verify that the total resistance equals the arithmetic sum: Req = R1 + R2 + ... + Rn, and that the same current flows through each resistor.",
    theory: "When resistors are connected end-to-end in a single branch without intermediate nodes, they are in series. Key properties: (1) Current I is identical through all series components; (2) Total potential difference equals the sum of individual voltage drops (V_total = V1 + V2 + ...); (3) Total equivalent resistance Req = R1 + R2 + ... + Rn.",
    requiredApparatus: [
      "DC Power Supply (0–20V)",
      "Resistor R1 (100 Ω)",
      "Resistor R2 (200 Ω)",
      "Digital Multimeter / Ammeter",
      "Connecting Wires"
    ],
    schematicDescription: "DC Source (+) connects to R1 Terminal A. R1 Terminal B connects directly to R2 Terminal A. R2 Terminal B returns to DC Source (-). Voltmeter measures across R1, R2, and total across both.",
    procedure: [
      "1. Place two resistors R1 (100 Ω) and R2 (200 Ω) in series.",
      "2. Connect DC Source (+) to R1-A, R1-B to R2-A, and R2-B to DC Source (-).",
      "3. Energize the circuit with V = 12 V.",
      "4. Measure current I. Verify that I = V / (R1 + R2) = 12 / 300 = 0.04 A (40 mA).",
      "5. Measure individual voltage drops V1 = I × R1 = 4 V, and V2 = I × R2 = 8 V. Verify V1 + V2 = 12 V."
    ],
    expectedObservations: "The total equivalent resistance increases when adding resistors in series. Current decreases proportionately, and the voltage drops across each resistor sum to the total supply voltage.",
    formulas: [
      { name: "Series Equivalent Resistance", formula: "Req = R1 + R2 + ... + Rn", explanation: "Total resistance is the direct algebraic sum" },
      { name: "Common Branch Current", formula: "I = V / Req", explanation: "The exact same current traverses every series element" },
      { name: "Individual Voltage Drop", formula: "Vk = I · Rk", explanation: "Voltage divides in direct ratio to individual resistances" }
    ],
    safetyNotes: [
      "Ensure connections are firm and no loose wires touch adjacent terminals.",
      "Note that opening any point in a series circuit stops current entirely for all components."
    ],
    learningObjectives: [
      "Master the equivalent resistance formula for series networks.",
      "Understand why high-resistance components drop greater voltage in series.",
      "Analyze the single current path constraint."
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Place Two Resistors",
        description: "Place Resistor R1 (100 Ω) and Resistor R2 (200 Ω) on the workspace.",
        targetCondition: "At least 2 Resistors present on workspace.",
        hint: "Add two resistors from the component sidebar.",
        validator: (components) => components.filter(c => c.type === 'RESISTOR').length >= 2
      },
      {
        stepNumber: 2,
        title: "Form the Series Resistor Daisy Chain",
        description: "Connect R1 Terminal B to R2 Terminal A with a jumper wire.",
        targetCondition: "R1 and R2 connected in series.",
        hint: "Draw a wire from R1-B to R2-A.",
        validator: (_, wires, readings) => wires.length >= 1 && readings.diagnostics.every(d => d.code !== 'ERR_SERIES_COUNT')
      },
      {
        stepNumber: 3,
        title: "Connect Power & Verify Req = 300 Ω",
        description: "Wire DC Source (+) to R1-A and R2-B to DC Source (-). Turn ON power.",
        targetCondition: "Valid circuit with Req = 300 Ω and 12 V DC applied.",
        hint: "Connect both ends of the chain to the DC supply terminals.",
        validator: (_, __, readings) => readings.status === 'VALID' && Math.abs(readings.totalResistance - 300) < 5
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'DC Supply (12V)',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 12 }
      },
      {
        id: 'res-s1',
        type: 'RESISTOR',
        label: 'Resistor R1 (100Ω)',
        x: 320,
        y: 140,
        rotation: 0,
        terminals: [
          { id: 'rs1-a', name: 'A', componentId: 'res-s1', relX: -45, relY: 0 },
          { id: 'rs1-b', name: 'B', componentId: 'res-s1', relX: 45, relY: 0 }
        ],
        properties: { resistance: 100 }
      },
      {
        id: 'res-s2',
        type: 'RESISTOR',
        label: 'Resistor R2 (200Ω)',
        x: 520,
        y: 140,
        rotation: 0,
        terminals: [
          { id: 'rs2-a', name: 'A', componentId: 'res-s2', relX: -45, relY: 0 },
          { id: 'rs2-b', name: 'B', componentId: 'res-s2', relX: 45, relY: 0 }
        ],
        properties: { resistance: 200 }
      }
    ],
    defaultWires: [
      { id: 'ws1', fromTerminalId: 'dc-pos', toTerminalId: 'rs1-a', color: '#f43f5e' },
      { id: 'ws2', fromTerminalId: 'rs1-b', toTerminalId: 'rs2-a', color: '#f59e0b' },
      { id: 'ws3', fromTerminalId: 'rs2-b', toTerminalId: 'dc-neg', color: '#38bdf8' }
    ]
  },
  {
    id: 'parallel-circuit',
    number: 3,
    title: "Parallel Resistor Network & Current Division",
    category: 'Basic Electrical',
    aim: "To verify that the equivalent resistance of resistors connected in parallel is given by 1/Req = 1/R1 + 1/R2, that the voltage across each parallel branch is equal, and that total current equals the sum of branch currents.",
    theory: "In a parallel circuit, all components are connected across the same two electrical common nodes. Therefore: (1) The potential difference (voltage) across every branch is identical: V1 = V2 = V_total; (2) The total current divides inversely proportional to branch resistance: I_total = I1 + I2; (3) The reciprocal of total resistance equals the sum of reciprocals: 1/Req = 1/R1 + 1/R2.",
    requiredApparatus: [
      "DC Power Supply (0–20V)",
      "Resistor R1 (100 Ω)",
      "Resistor R2 (200 Ω)",
      "Digital Multimeter / Ammeters",
      "Connecting Wires"
    ],
    schematicDescription: "Both R1 Terminal A and R2 Terminal A connect to the common positive bus (+). Both R1 Terminal B and R2 Terminal B connect to the common negative return bus (-).",
    procedure: [
      "1. Place resistors R1 (100 Ω) and R2 (200 Ω) in parallel on the workspace.",
      "2. Connect Terminal A of R1 and Terminal A of R2 together and link to DC (+).",
      "3. Connect Terminal B of R1 and Terminal B of R2 together and link to DC (-).",
      "4. Apply 10 V DC. Verify that equivalent resistance is Req = (100 × 200) / (100 + 200) = 66.67 Ω.",
      "5. Calculate branch currents: I1 = 10 / 100 = 0.10 A, I2 = 10 / 200 = 0.05 A. Verify total current I = 0.15 A."
    ],
    expectedObservations: "The equivalent resistance of parallel resistors is always LESS than the smallest individual branch resistance. Current splits with the lower resistance carrying the larger share of current.",
    formulas: [
      { name: "Parallel Equivalent Resistance", formula: "1/Req = 1/R1 + 1/R2 = (R1·R2)/(R1 + R2)", explanation: "Reciprocal addition of parallel conductances" },
      { name: "Current Divider Rule", formula: "I1 = I_total · (R2 / (R1 + R2))", explanation: "Branch current is proportional to the opposite branch's resistance" },
      { name: "Kirchhoff's Current Law", formula: "I_total = I1 + I2", explanation: "Sum of entering currents equals sum of leaving currents" }
    ],
    safetyNotes: [
      "Because parallel resistance decreases, total current drawn from the supply increases. Check power supply current limits."
    ],
    learningObjectives: [
      "Understand why household wiring is connected in parallel rather than series.",
      "Verify that branch voltage remains independent of branch loads.",
      "Calculate equivalent parallel conductance."
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Place Two Resistors in Parallel",
        description: "Arrange R1 (100 Ω) and R2 (200 Ω) parallel to each other.",
        targetCondition: "Two resistors positioned in parallel orientation.",
        hint: "Add R1 and R2 to the workspace.",
        validator: (components) => components.filter(c => c.type === 'RESISTOR').length >= 2
      },
      {
        stepNumber: 2,
        title: "Wire Common Nodes",
        description: "Connect both Terminal A pins to DC (+), and both Terminal B pins to DC (-).",
        targetCondition: "Both resistors wired across supply terminals.",
        hint: "Connect DC (+) to R1-A and R2-A. Connect DC (-) to R1-B and R2-B.",
        validator: (_, __, readings) => readings.status === 'VALID' && Math.abs(readings.totalResistance - 66.67) < 2
      },
      {
        stepNumber: 3,
        title: "Verify Current Division",
        description: "Check branch currents I1 and I2 on the meter. Verify I1 = 2 × I2 since R2 = 2 × R1.",
        targetCondition: "Valid parallel operation with I1 ≈ 0.1A and I2 ≈ 0.05A at 10V.",
        hint: "Observe the component currents panel.",
        validator: (_, __, readings) => readings.status === 'VALID' && readings.totalCurrent > 0.14
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'DC Supply (10V)',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 10 }
      },
      {
        id: 'res-p1',
        type: 'RESISTOR',
        label: 'Resistor R1 (100Ω)',
        x: 340,
        y: 130,
        rotation: 90,
        terminals: [
          { id: 'rp1-a', name: 'A', componentId: 'res-p1', relX: 0, relY: -45 },
          { id: 'rp1-b', name: 'B', componentId: 'res-p1', relX: 0, relY: 45 }
        ],
        properties: { resistance: 100 }
      },
      {
        id: 'res-p2',
        type: 'RESISTOR',
        label: 'Resistor R2 (200Ω)',
        x: 520,
        y: 130,
        rotation: 90,
        terminals: [
          { id: 'rp2-a', name: 'A', componentId: 'res-p2', relX: 0, relY: -45 },
          { id: 'rp2-b', name: 'B', componentId: 'res-p2', relX: 0, relY: 45 }
        ],
        properties: { resistance: 200 }
      }
    ],
    defaultWires: [
      { id: 'wp1', fromTerminalId: 'dc-pos', toTerminalId: 'rp1-a', color: '#f43f5e' },
      { id: 'wp2', fromTerminalId: 'rp1-a', toTerminalId: 'rp2-a', color: '#f43f5e' },
      { id: 'wp3', fromTerminalId: 'rp1-b', toTerminalId: 'dc-neg', color: '#38bdf8' },
      { id: 'wp4', fromTerminalId: 'rp2-b', toTerminalId: 'rp1-b', color: '#38bdf8' }
    ]
  },
  {
    id: 'kvl-experiment',
    number: 4,
    title: "Kirchhoff's Voltage Law (KVL)",
    category: 'Basic Electrical',
    aim: "To verify that the algebraic sum of all voltages around any closed loop in a circuit is equal to zero: Σ V = 0.",
    theory: "Kirchhoff's Voltage Law (KVL) is a direct consequence of the conservation of energy in an electrostatic field. For any closed loop: V_source - V_R1 - V_R2 - ... = 0. The energy supplied per unit charge by the electromotive source equals the total energy dissipated per unit charge across the passive elements.",
    requiredApparatus: [
      "DC Voltage Source (15V)",
      "Resistors R1 (100 Ω), R2 (200 Ω), R3 (300 Ω)",
      "Digital Voltmeter",
      "Connecting Wires"
    ],
    schematicDescription: "Closed loop formed by DC Source and 3 resistors in series. Voltmeter measures potential differences across each element in clockwise loop traversal.",
    procedure: [
      "1. Connect three resistors (100Ω, 200Ω, 300Ω) in series with a 15V DC source.",
      "2. Calculate loop current: I = 15 / (100 + 200 + 300) = 15 / 600 = 0.025 A (25 mA).",
      "3. Measure V_R1 = 2.5 V, V_R2 = 5.0 V, V_R3 = 7.5 V.",
      "4. Sum the voltage drops: 2.5 + 5.0 + 7.5 = 15.0 V. Verify V_source - (V_R1 + V_R2 + V_R3) = 0."
    ],
    expectedObservations: "The sum of voltage drops across the series elements exactly equals the electromotive force supplied by the source, confirming conservation of energy.",
    formulas: [
      { name: "KVL Statement", formula: "Σ V_loop = 0", explanation: "Algebraic sum of voltages around any closed loop is zero" },
      { name: "Loop Equation", formula: "V_s - I·R1 - I·R2 - I·R3 = 0", explanation: "Source voltage equals sum of IR drops" }
    ],
    safetyNotes: [
      "Observe polarity signs when writing and measuring loop voltages."
    ],
    learningObjectives: [
      "Formulate mathematical loop equations for DC networks.",
      "Connect theory of conservation of energy to circuit analysis."
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Build the 3-Resistor Loop",
        description: "Connect three resistors in series with the DC source.",
        targetCondition: "Valid series loop with total resistance 600 Ω.",
        hint: "Wire R1, R2, and R3 end-to-end and close the loop.",
        validator: (_, __, readings) => readings.status === 'VALID' && Math.abs(readings.totalResistance - 600) < 10
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'DC Supply (15V)',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 15 }
      },
      {
        id: 'res-kvl-1',
        type: 'RESISTOR',
        label: 'R1 (100Ω)',
        x: 280,
        y: 120,
        rotation: 0,
        terminals: [
          { id: 'rkvl1-a', name: 'A', componentId: 'res-kvl-1', relX: -45, relY: 0 },
          { id: 'rkvl1-b', name: 'B', componentId: 'res-kvl-1', relX: 45, relY: 0 }
        ],
        properties: { resistance: 100 }
      },
      {
        id: 'res-kvl-2',
        type: 'RESISTOR',
        label: 'R2 (200Ω)',
        x: 460,
        y: 120,
        rotation: 0,
        terminals: [
          { id: 'rkvl2-a', name: 'A', componentId: 'res-kvl-2', relX: -45, relY: 0 },
          { id: 'rkvl2-b', name: 'B', componentId: 'res-kvl-2', relX: 45, relY: 0 }
        ],
        properties: { resistance: 200 }
      },
      {
        id: 'res-kvl-3',
        type: 'RESISTOR',
        label: 'R3 (300Ω)',
        x: 640,
        y: 200,
        rotation: 90,
        terminals: [
          { id: 'rkvl3-a', name: 'A', componentId: 'res-kvl-3', relX: 0, relY: -45 },
          { id: 'rkvl3-b', name: 'B', componentId: 'res-kvl-3', relX: 0, relY: 45 }
        ],
        properties: { resistance: 300 }
      }
    ],
    defaultWires: [
      { id: 'wkvl1', fromTerminalId: 'dc-pos', toTerminalId: 'rkvl1-a', color: '#f43f5e' },
      { id: 'wkvl2', fromTerminalId: 'rkvl1-b', toTerminalId: 'rkvl2-a', color: '#f59e0b' },
      { id: 'wkvl3', fromTerminalId: 'rkvl2-b', toTerminalId: 'rkvl3-a', color: '#00f0ff' },
      { id: 'wkvl4', fromTerminalId: 'rkvl3-b', toTerminalId: 'dc-neg', color: '#38bdf8' }
    ]
  },
  {
    id: 'kcl-experiment',
    number: 5,
    title: "Kirchhoff's Current Law (KCL)",
    category: 'Basic Electrical',
    aim: "To verify that the algebraic sum of currents entering and leaving any node in an electrical circuit is zero: Σ I = 0.",
    theory: "Kirchhoff's Current Law (KCL) is based on the principle of conservation of electric charge. Because charge cannot accumulate at an infinitesimal point (node), the total charge entering a node per unit time must equal the total charge leaving the node per unit time: I_in = I_out1 + I_out2.",
    requiredApparatus: [
      "DC Power Supply (12V)",
      "Resistors (100 Ω, 220 Ω)",
      "Ammeters",
      "Connecting Wires"
    ],
    schematicDescription: "Supply current I enters a junction node, splitting into branches I1 and I2 through parallel resistors, and recombines at the return node.",
    procedure: [
      "1. Construct a parallel junction with two branches.",
      "2. Measure total entering current I_in and branch currents I1, I2.",
      "3. Verify that I_in - (I1 + I2) = 0."
    ],
    expectedObservations: "The total measured current entering the junction exactly equals the sum of branch currents leaving the junction.",
    formulas: [
      { name: "KCL Statement", formula: "Σ I_node = 0", explanation: "Total current entering equals total current exiting" }
    ],
    safetyNotes: ["Ensure all meter polarities are oriented in the direction of assumed current flow."],
    learningObjectives: ["Understand nodal analysis and conservation of charge."],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Build Junction & Verify Current Sum",
        description: "Connect parallel branches and verify that supply current equals sum of branch currents.",
        targetCondition: "Circuit energized with parallel branch division.",
        hint: "Wire two resistors in parallel.",
        validator: (_, __, readings) => readings.status === 'VALID' && readings.totalCurrent > 0
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'DC Supply (12V)',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 12 }
      },
      {
        id: 'res-kcl-1',
        type: 'RESISTOR',
        label: 'R1 (100Ω)',
        x: 350,
        y: 130,
        rotation: 90,
        terminals: [
          { id: 'rkcl1-a', name: 'A', componentId: 'res-kcl-1', relX: 0, relY: -45 },
          { id: 'rkcl1-b', name: 'B', componentId: 'res-kcl-1', relX: 0, relY: 45 }
        ],
        properties: { resistance: 100 }
      },
      {
        id: 'res-kcl-2',
        type: 'RESISTOR',
        label: 'R2 (200Ω)',
        x: 520,
        y: 130,
        rotation: 90,
        terminals: [
          { id: 'rkcl2-a', name: 'A', componentId: 'res-kcl-2', relX: 0, relY: -45 },
          { id: 'rkcl2-b', name: 'B', componentId: 'res-kcl-2', relX: 0, relY: 45 }
        ],
        properties: { resistance: 200 }
      }
    ],
    defaultWires: [
      { id: 'wkcl1', fromTerminalId: 'dc-pos', toTerminalId: 'rkcl1-a', color: '#f43f5e' },
      { id: 'wkcl2', fromTerminalId: 'rkcl1-a', toTerminalId: 'rkcl2-a', color: '#f43f5e' },
      { id: 'wkcl3', fromTerminalId: 'rkcl1-b', toTerminalId: 'dc-neg', color: '#38bdf8' },
      { id: 'wkcl4', fromTerminalId: 'rkcl2-b', toTerminalId: 'rkcl1-b', color: '#38bdf8' }
    ]
  },
  {
    id: 'voltage-divider',
    number: 6,
    title: "Voltage Divider Circuit",
    category: 'Analog Electronics',
    aim: "To demonstrate how a pair of series resistors scales down an input voltage to produce a fractional output voltage: Vout = Vin × (R2 / (R1 + R2)).",
    theory: "A voltage divider produces an output voltage that is a fraction of its input voltage. It is one of the most fundamental subcircuits in electronics, used for biasing transistors, referencing sensor voltages (such as LDRs and thermistors), and level shifting.",
    requiredApparatus: [
      "DC Supply (10V)",
      "Upper Resistor R1 (1000 Ω)",
      "Lower Resistor R2 (1000 Ω / 2000 Ω)",
      "Digital Voltmeter"
    ],
    schematicDescription: "Vin applied across R1 + R2 in series. Vout is measured from the junction between R1 and R2 relative to common ground.",
    procedure: [
      "1. Place R1 (1kΩ) and R2 (1kΩ) in series across 10V DC.",
      "2. Measure Vout at the midpoint. Verify Vout = 10 × (1000 / 2000) = 5.0 V.",
      "3. Replace R2 with 2kΩ. Verify Vout = 10 × (2000 / 3000) = 6.67 V."
    ],
    expectedObservations: "When R1 = R2, output voltage is exactly half the input voltage regardless of absolute resistance values (neglecting loading effects).",
    formulas: [
      { name: "Divider Formula", formula: "Vout = Vin · [R2 / (R1 + R2)]", explanation: "Output voltage fraction determined by resistance ratio" }
    ],
    safetyNotes: ["Remember that connecting a low-impedance load across Vout causes loading error."],
    learningObjectives: ["Design potentiometer and sensor biasing divider networks."],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Build Symmetrical 1:1 Divider",
        description: "Connect two 100Ω resistors in series across 10V to observe 5V midpoint voltage.",
        targetCondition: "Valid series divider with equal resistors.",
        hint: "Wire two identical resistors in series across 10V DC.",
        validator: (_, __, readings) => readings.status === 'VALID' && readings.sourceVoltage === 10
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'Vin Supply (10V)',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 10 }
      },
      {
        id: 'res-div-1',
        type: 'RESISTOR',
        label: 'R1 (Upper 100Ω)',
        x: 340,
        y: 120,
        rotation: 0,
        terminals: [
          { id: 'rdiv1-a', name: 'A', componentId: 'res-div-1', relX: -45, relY: 0 },
          { id: 'rdiv1-b', name: 'B', componentId: 'res-div-1', relX: 45, relY: 0 }
        ],
        properties: { resistance: 100 }
      },
      {
        id: 'res-div-2',
        type: 'RESISTOR',
        label: 'R2 (Lower 100Ω)',
        x: 520,
        y: 220,
        rotation: 90,
        terminals: [
          { id: 'rdiv2-a', name: 'A', componentId: 'res-div-2', relX: 0, relY: -45 },
          { id: 'rdiv2-b', name: 'B', componentId: 'res-div-2', relX: 0, relY: 45 }
        ],
        properties: { resistance: 100 }
      }
    ],
    defaultWires: [
      { id: 'wdiv1', fromTerminalId: 'dc-pos', toTerminalId: 'rdiv1-a', color: '#f43f5e' },
      { id: 'wdiv2', fromTerminalId: 'rdiv1-b', toTerminalId: 'rdiv2-a', color: '#f59e0b' },
      { id: 'wdiv3', fromTerminalId: 'rdiv2-b', toTerminalId: 'dc-neg', color: '#38bdf8' }
    ]
  },
  {
    id: 'rc-transient',
    number: 7,
    title: "RC Circuit Charging & Discharging Dynamics",
    category: 'Analog Electronics',
    aim: "To investigate the time-dependent transient charging and discharging characteristics of a series Resistor-Capacitor (RC) network, determine the time constant τ = R × C, and plot the transient curves.",
    theory: "When a DC voltage is applied to a series RC circuit, the capacitor does not charge instantaneously. Charge accumulates at an exponential rate determined by the time constant τ = R × C. During charging: Vc(t) = Vs × (1 - e^(-t/τ)). At t = τ, Vc reaches 63.2% of final voltage Vs. At t = 5τ, the capacitor reaches ~99.3% (steady state). During discharging: Vc(t) = V0 × e^(-t/τ).",
    requiredApparatus: [
      "DC Voltage Source (10V)",
      "Resistor (10 kΩ = 10,000 Ω)",
      "Electrolytic Capacitor (100 μF)",
      "SPDT Switch / Toggle",
      "Digital Oscilloscope / Chart Plotter"
    ],
    schematicDescription: "DC Source (+) connects through switch to Resistor. Resistor connects to Capacitor (+). Capacitor (-) returns to Ground. Voltage across capacitor monitored over time.",
    procedure: [
      "1. Place a 10V DC source, a 10 kΩ resistor, and a 100 μF capacitor on the board.",
      "2. Calculate time constant: τ = R × C = 10,000 Ω × 0.0001 F = 1.00 second.",
      "3. Start the transient simulation timer and observe the voltage curve across the capacitor.",
      "4. Verify that at t = 1.0s, capacitor voltage reaches approximately 6.32 V (63.2% of 10V).",
      "5. Observe that after t = 5.0s (5τ), capacitor voltage approaches full steady-state 10.0 V and current drops to 0 A."
    ],
    expectedObservations: "Voltage across the capacitor rises asymptotically toward supply voltage while charging current decays exponentially toward zero.",
    formulas: [
      { name: "Time Constant", formula: "τ = R · C", explanation: "Time required to charge to 63.2% of full supply voltage" },
      { name: "Charging Equation", formula: "Vc(t) = Vs · (1 - e^(-t / τ))", explanation: "Exponential rise of capacitor terminal voltage" },
      { name: "Current Decay", formula: "I(t) = (Vs / R) · e^(-t / τ)", explanation: "Decay of charging current as opposing counter-EMF builds" }
    ],
    safetyNotes: [
      "Observe polarity of electrolytic capacitors. Reversing polarity can cause dielectric rupture.",
      "Capacitors retain dangerous charge even after power is disconnected. Always discharge before handling."
    ],
    learningObjectives: [
      "Understand first-order differential equation transient response.",
      "Calculate and interpret RC time constant τ.",
      "Analyze exponential charging and discharging oscilloscope waveforms."
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        title: "Place Resistor and Capacitor",
        description: "Place a Resistor (1000Ω) and Capacitor (100μF) in series.",
        targetCondition: "Resistor and Capacitor present in workspace.",
        hint: "Add a resistor and a capacitor from the component library.",
        validator: (components) => components.some(c => c.type === 'RESISTOR') && components.some(c => c.type === 'CAPACITOR')
      },
      {
        stepNumber: 2,
        title: "Complete RC Circuit Loop",
        description: "Connect DC (+) to Resistor, Resistor to Capacitor (+), and Capacitor (-) to DC (-).",
        targetCondition: "Valid RC circuit loop connected.",
        hint: "Wire the components in series loop.",
        validator: (_, __, readings) => readings.status === 'VALID' && !!readings.rcTransient
      },
      {
        stepNumber: 3,
        title: "Run Transient Simulation",
        description: "Press Start in the simulation playback controls to observe the live charging curve.",
        targetCondition: "Transient simulation elapsed time > 1.0s.",
        hint: "Click the Play button in the transient playback controls.",
        validator: (_, __, readings) => !!readings.rcTransient && readings.rcTransient.time > 0.5
      }
    ],
    defaultComponents: [
      {
        id: 'dc-src-1',
        type: 'DC_SOURCE',
        label: 'DC Supply (10V)',
        x: 100,
        y: 200,
        rotation: 0,
        terminals: [
          { id: 'dc-pos', name: 'pos', componentId: 'dc-src-1', relX: 40, relY: -20 },
          { id: 'dc-neg', name: 'neg', componentId: 'dc-src-1', relX: 40, relY: 20 }
        ],
        properties: { voltage: 10 }
      },
      {
        id: 'res-rc-1',
        type: 'RESISTOR',
        label: 'Resistor R (1000Ω)',
        x: 320,
        y: 120,
        rotation: 0,
        terminals: [
          { id: 'rrc1-a', name: 'A', componentId: 'res-rc-1', relX: -45, relY: 0 },
          { id: 'rrc1-b', name: 'B', componentId: 'res-rc-1', relX: 45, relY: 0 }
        ],
        properties: { resistance: 1000 }
      },
      {
        id: 'cap-1',
        type: 'CAPACITOR',
        label: 'Capacitor C (100μF)',
        x: 520,
        y: 200,
        rotation: 90,
        terminals: [
          { id: 'cap-pos', name: 'pos', componentId: 'cap-1', relX: 0, relY: -40 },
          { id: 'cap-neg', name: 'neg', componentId: 'cap-1', relX: 0, relY: 40 }
        ],
        properties: { capacitance: 100 }
      }
    ],
    defaultWires: [
      { id: 'wrc1', fromTerminalId: 'dc-pos', toTerminalId: 'rrc1-a', color: '#f43f5e' },
      { id: 'wrc2', fromTerminalId: 'rrc1-b', toTerminalId: 'cap-pos', color: '#00f0ff' },
      { id: 'wrc3', fromTerminalId: 'cap-neg', toTerminalId: 'dc-neg', color: '#38bdf8' }
    ]
  }
];
