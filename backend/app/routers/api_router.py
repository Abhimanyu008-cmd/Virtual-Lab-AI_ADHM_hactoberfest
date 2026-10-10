"""
VirtuLab AI - Main API Router (FastAPI)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services.simulation_engine import simulate_circuit_py
from ..services.ollama_service import check_ollama_health, chat_with_mentor
from ..services.viva_service import evaluate_viva_py

router = APIRouter(prefix="/api")

# --- System Health & Ollama Status ---
@router.get("/health")
def get_health():
    return {"status": "ok", "app": "VirtuLab AI Backend", "version": "1.0.0"}

@router.get("/ollama/status")
async def get_ollama_status():
    return await check_ollama_health()

@router.post("/ollama/chat")
async def chat_mentor(req: schemas.OllamaChatRequest):
    reply = await chat_with_mentor(req.messages, req.context)
    return {"reply": reply}

# --- Deterministic Circuit Simulation ---
@router.post("/simulation/solve", response_model=schemas.SimulationResponse)
def solve_circuit(req: schemas.SimulationRequest):
    return simulate_circuit_py(
        req.components,
        req.wires,
        req.powerSupplyOn,
        req.experimentId,
        req.rcTimeSeconds
    )

# --- AI Viva Examination ---
@router.post("/viva/evaluate", response_model=schemas.VivaEvaluationResponse)
async def evaluate_viva(req: schemas.VivaEvaluationRequest):
    return await evaluate_viva_py(
        req.question,
        req.studentAnswer,
        req.experimentTitle,
        req.difficulty
    )

# --- Attendance Records ---
@router.get("/attendance")
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.AttendanceRecord).all()

@router.post("/attendance")
def create_attendance(data: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    course = db.query(models.LabCourse).filter(models.LabCourse.id == data.courseId).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    rec = models.AttendanceRecord(
        id=f"att-{int(models.time.time())}",
        course_id=course.id,
        course_code=course.code,
        course_title=course.title,
        date=data.date,
        topic=data.topic,
        status=data.status,
        duration_hours=data.durationHours,
        remarks=data.remarks
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

# --- Live Lab Schedules ---
@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db)):
    return db.query(models.LabSession).all()

@router.patch("/sessions/{session_id}")
def update_session(session_id: str, data: schemas.SessionStatusUpdate, db: Session = Depends(get_db)):
    sess = db.query(models.LabSession).filter(models.LabSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    sess.status = data.status
    if data.announcement is not None:
        sess.announcement = data.announcement
    db.commit()
    return sess

# --- Lab Notice Board ---
@router.get("/notices")
def get_notices(db: Session = Depends(get_db)):
    return db.query(models.LabNotice).all()

@router.post("/notices")
def create_notice(data: schemas.NoticeCreate, db: Session = Depends(get_db)):
    notice = models.LabNotice(
        id=f"not-{int(models.time.time())}",
        title=data.title,
        description=data.description,
        category=data.category,
        date_posted=models.time.strftime("%Y-%m-%d"),
        priority=data.priority,
        deadline=data.deadline,
        posted_by=data.postedBy
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

@router.delete("/notices/{notice_id}")
def delete_notice(notice_id: str, db: Session = Depends(get_db)):
    notice = db.query(models.LabNotice).filter(models.LabNotice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted"}
