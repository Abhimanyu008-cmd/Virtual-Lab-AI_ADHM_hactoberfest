"""
VirtuLab AI - Deterministic Circuit Simulation Engine (Python Backend)
Calculates physical electrical quantities and detects short circuits / open loops.
"""

import math
from typing import Dict, List, Any
from ..schemas.schemas import ComponentSchema, WireSchema, SimulationResponse, MistakeDiagnosticSchema
from .mistake_detector import detect_mistakes_py

class UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, i: str) -> str:
        if i not in self.parent:
            self.parent[i] = i
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i: str, j: str):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i != root_j:
            self.parent[root_i] = root_j

    def connected(self, i: str, j: str) -> bool:
        return self.find(i) == self.find(j)

def simulate_circuit_py(
    components: List[ComponentSchema],
    wires: List[WireSchema],
    power_on: bool,
    experiment_id: str,
    rc_time: float
) -> SimulationResponse:
    if not power_on:
        return SimulationResponse(
            status="POWER_OFF",
            statusMessage="DC Power Supply is switched OFF.",
            sourceVoltage=0.0,
            totalCurrent=0.0,
            totalResistance=0.0,
            totalPower=0.0,
            diagnostics=[]
        )

    dc_sources = [c for c in components if c.type == "DC_SOURCE"]
    resistors = [c for c in components if c.type == "RESISTOR"]
    switches = [c for c in components if c.type == "SWITCH"]
    capacitors = [c for c in components if c.type == "CAPACITOR"]

    if not dc_sources:
        return SimulationResponse(
            status="INCOMPLETE",
            statusMessage="No DC Voltage Source present in workspace.",
            sourceVoltage=0.0,
            totalCurrent=0.0,
            totalResistance=0.0,
            totalPower=0.0,
            diagnostics=[]
        )

    dc_src = dc_sources[0]
    source_voltage = float(dc_src.properties.get("voltage", 10.0))
    pos_term = next((t.id for t in dc_src.terminals if t.name == "pos"), None)
    neg_term = next((t.id for t in dc_src.terminals if t.name == "neg"), None)

    if not pos_term or not neg_term:
        return SimulationResponse(
            status="INVALID",
            statusMessage="DC Source terminals are invalid.",
            sourceVoltage=0.0,
            totalCurrent=0.0,
            totalResistance=0.0,
            totalPower=0.0
        )

    uf = UnionFind()
    for w in wires:
        uf.union(w.fromTerminalId, w.toTerminalId)

    has_open_switch = False
    for sw in switches:
        term_a = next((t.id for t in sw.terminals if t.name == "A"), None)
        term_b = next((t.id for t in sw.terminals if t.name == "B"), None)
        if term_a and term_b:
            if sw.properties.get("closed", True):
                uf.union(term_a, term_b)
            else:
                has_open_switch = True

    # Check direct short circuit
    if uf.connected(pos_term, neg_term):
        return SimulationResponse(
            status="SHORT_CIRCUIT",
            statusMessage="CRITICAL: Direct Short Circuit detected across DC supply!",
            sourceVoltage=source_voltage,
            totalCurrent=999.0,
            totalResistance=0.0,
            totalPower=9999.0,
            diagnostics=[]
        )

    pos_net = uf.find(pos_term)
    neg_net = uf.find(neg_term)

    connected_resistors = []
    for r in resistors:
        t_a = next((t.id for t in r.terminals if t.name == "A"), None)
        t_b = next((t.id for t in r.terminals if t.name == "B"), None)
        r_val = float(r.properties.get("resistance", 100.0))
        if t_a and t_b:
            connected_resistors.append({
                "comp": r,
                "net_a": uf.find(t_a),
                "net_b": uf.find(t_b),
                "r": r_val
            })

    # Parallel check: all bridging pos and neg directly
    bridged = [r for r in connected_resistors if (r["net_a"] == pos_net and r["net_b"] == neg_net) or (r["net_a"] == neg_net and r["net_b"] == pos_net)]

    comp_voltages = {}
    comp_currents = {}
    comp_powers = {}
    status = "VALID"
    msg = "Circuit energized in normal steady state."

    if bridged and len(bridged) == len(connected_resistors):
        # Parallel
        recip_sum = sum(1.0 / r["r"] for r in bridged)
        total_resistance = 1.0 / recip_sum
        total_current = source_voltage / total_resistance
        for r in bridged:
            i_b = source_voltage / r["r"]
            comp_voltages[r["comp"].id] = source_voltage
            comp_currents[r["comp"].id] = i_b
            comp_powers[r["comp"].id] = source_voltage * i_b
    elif len(connected_resistors) > 0:
        # Series check
        total_resistance = sum(r["r"] for r in connected_resistors)
        total_current = source_voltage / total_resistance
        for r in connected_resistors:
            v_drop = total_current * r["r"]
            comp_voltages[r["comp"].id] = v_drop
            comp_currents[r["comp"].id] = total_current
            comp_powers[r["comp"].id] = v_drop * total_current
    else:
        status = "INCOMPLETE"
        msg = "Open circuit. Connect resistor between source terminals."
        total_resistance = 0.0
        total_current = 0.0

    total_power = source_voltage * total_current
    comp_voltages[dc_src.id] = source_voltage
    comp_currents[dc_src.id] = total_current
    comp_powers[dc_src.id] = total_power

    diagnostics = detect_mistakes_py(components, wires, status, experiment_id, source_voltage)

    return SimulationResponse(
        status=status,
        statusMessage=msg,
        sourceVoltage=source_voltage,
        totalCurrent=total_current,
        totalResistance=total_resistance,
        totalPower=total_power,
        componentVoltages=comp_voltages,
        componentCurrents=comp_currents,
        componentPowers=comp_powers,
        diagnostics=diagnostics
    )
