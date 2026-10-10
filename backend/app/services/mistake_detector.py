"""
VirtuLab AI - Rule-Based Mistake Detector (Python Backend)
"""

import time
from typing import List
from ..schemas.schemas import ComponentSchema, WireSchema, MistakeDiagnosticSchema

def detect_mistakes_py(
    components: List[ComponentSchema],
    wires: List[WireSchema],
    status: str,
    experiment_id: str,
    source_voltage: float
) -> List[MistakeDiagnosticSchema]:
    diagnostics = []

    if len(wires) == 0 and len(components) > 1:
        diagnostics.append(MistakeDiagnosticSchema(
            id=f"diag-{int(time.time())}-1",
            code="ERR_NO_WIRES",
            category="OPEN_CIRCUIT",
            what="No connecting wires exist between the placed circuit components.",
            where="Breadboard workspace",
            why="Electric charges require a continuous conductive path to complete a circuit loop.",
            action="Draw wires between component terminal pins.",
            concept="Circuit Continuity and Metallic Conductors",
            severity="critical",
            timestamp=time.time()
        ))

    if experiment_id == "ohms-law":
        resistors = [c for c in components if c.type == "RESISTOR"]
        if len(resistors) == 0:
            diagnostics.append(MistakeDiagnosticSchema(
                id=f"diag-{int(time.time())}-2",
                code="ERR_OHM_NO_LOAD",
                category="CONNECTION",
                what="Ohm's Law requires a test resistor to investigate V = I·R.",
                where="Workspace load section",
                why="Linear V-I relationship must be established across a resistive load.",
                action="Place a resistor from the rack and connect it in the loop.",
                concept="Ohm's Law (V = I·R)",
                severity="critical",
                timestamp=time.time()
            ))

    return diagnostics
