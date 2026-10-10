"""
VirtuLab AI - Pydantic Request & Response Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TerminalSchema(BaseModel):
    id: str
    name: str
    componentId: str
    relX: float
    relY: float

class ComponentSchema(BaseModel):
    id: str
    type: str
    label: str
    x: float
    y: float
    rotation: int = 0
    terminals: List[TerminalSchema] = []
    properties: Dict[str, Any] = {}

class WireSchema(BaseModel):
    id: str
    fromTerminalId: str
    toTerminalId: str
    color: Optional[str] = None

class SimulationRequest(BaseModel):
    components: List[ComponentSchema]
    wires: List[WireSchema]
    powerSupplyOn: bool = True
    experimentId: str = "ohms-law"
    rcTimeSeconds: float = 0.0

class MistakeDiagnosticSchema(BaseModel):
    id: str
    code: str
    category: str
    what: str
    where: str
    why: str
    action: str
    concept: str
    severity: str
    timestamp: float

class SimulationResponse(BaseModel):
    status: str
    statusMessage: str
    sourceVoltage: float
    totalCurrent: float
    totalResistance: float
    totalPower: float
    componentVoltages: Dict[str, float] = {}
    componentCurrents: Dict[str, float] = {}
    componentPowers: Dict[str, float] = {}
    rcTransient: Optional[Dict[str, Any]] = None
    diagnostics: List[MistakeDiagnosticSchema] = []

class OllamaChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    context: Dict[str, Any]

class VivaEvaluationRequest(BaseModel):
    question: str
    studentAnswer: str
    experimentTitle: str
    difficulty: str

class VivaEvaluationResponse(BaseModel):
    score: float
    correctConcepts: List[str]
    missingConcepts: List[str]
    incorrectStatements: List[str]
    modelAnswer: str
    explanation: str
    followUpQuestion: Optional[str] = None

class AttendanceCreate(BaseModel):
    courseId: str
    date: str
    topic: str
    status: str = "PRESENT"
    durationHours: int = 2
    remarks: Optional[str] = None

class NoticeCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "Medium"
    deadline: Optional[str] = None
    postedBy: str = "Dr. R. K. Mehta"

class SessionStatusUpdate(BaseModel):
    status: str
    announcement: Optional[str] = None
