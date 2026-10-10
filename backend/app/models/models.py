"""
VirtuLab AI - SQLAlchemy Database Models
"""

import time
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="student")  # "student" or "instructor"
    batch = Column(String, default="EE-2024")

class LabCourse(Base):
    __tablename__ = "lab_courses"
    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    instructor = Column(String, nullable=False)
    total_sessions = Column(Integer, default=14)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(String, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("lab_courses.id"))
    course_code = Column(String, nullable=False)
    course_title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    status = Column(String, default="PRESENT")  # PRESENT, ABSENT, EXCUSED
    duration_hours = Column(Integer, default=2)
    remarks = Column(String, nullable=True)

class LabSession(Base):
    __tablename__ = "lab_sessions"
    id = Column(String, primary_key=True, index=True)
    course_code = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    experiment_title = Column(String, nullable=False)
    instructor = Column(String, nullable=False)
    room = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    status = Column(String, default="Upcoming")  # Upcoming, Ongoing, Delayed, Cancelled, Completed
    announcement = Column(Text, nullable=True)
    workstations_available = Column(Integer, default=20)
    total_workstations = Column(Integer, default=20)

class LabNotice(Base):
    __tablename__ = "lab_notices"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    date_posted = Column(String, nullable=False)
    deadline = Column(String, nullable=True)
    priority = Column(String, default="Medium")  # High, Medium, Low
    posted_by = Column(String, nullable=False)
    attachment_name = Column(String, nullable=True)
    attachment_size = Column(String, nullable=True)

class ExperimentAttempt(Base):
    __tablename__ = "experiment_attempts"
    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, nullable=False, index=True)
    experiment_title = Column(String, nullable=False)
    timestamp = Column(Float, default=time.time)
    time_spent_seconds = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    mistakes_count = Column(Integer, default=0)
    corrected_mistakes_count = Column(Integer, default=0)
    steps_completed = Column(Integer, default=0)
    total_steps = Column(Integer, default=0)
    final_voltage = Column(Float, nullable=True)
    final_current = Column(Float, nullable=True)
    final_resistance = Column(Float, nullable=True)
    final_power = Column(Float, nullable=True)

class MistakeRecord(Base):
    __tablename__ = "mistake_records"
    id = Column(String, primary_key=True, index=True)
    attempt_id = Column(String, ForeignKey("experiment_attempts.id"), nullable=True)
    experiment_id = Column(String, nullable=False)
    category = Column(String, nullable=False)
    what = Column(Text, nullable=False)
    where_location = Column(String, nullable=False)
    why = Column(Text, nullable=False)
    action = Column(Text, nullable=False)
    concept = Column(String, nullable=False)
    timestamp = Column(Float, default=time.time)

class VivaSession(Base):
    __tablename__ = "viva_sessions"
    id = Column(String, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    experiment_id = Column(String, nullable=False)
    experiment_title = Column(String, nullable=False)
    difficulty = Column(String, default="Intermediate")
    total_questions = Column(Integer, default=3)
    completed_questions = Column(Integer, default=3)
    average_score = Column(Float, default=0.0)
    timestamp = Column(Float, default=time.time)
    strong_concepts = Column(Text, nullable=True)      # JSON string
    concepts_to_revise = Column(Text, nullable=True)   # JSON string
    items_json = Column(Text, nullable=True)           # Full questions/answers JSON
