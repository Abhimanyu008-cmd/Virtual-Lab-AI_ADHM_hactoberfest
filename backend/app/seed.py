"""
VirtuLab AI - Database Seed Script
Populates initial demonstration courses, sessions, and notices without duplicates.
"""

from .database import SessionLocal, Base, engine
from .models import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.LabCourse).first():
        db.close()
        return

    # Seed User
    user = models.User(
        id="usr-demo-01",
        name="Aarav Sharma",
        roll_number="22EE1042",
        email="aarav.sharma@engg.edu",
        role="student",
        batch="EE-2024 / Sec-B"
    )
    db.add(user)

    # Seed Courses
    courses = [
        models.LabCourse(id="c1", code="EE102", title="Basic Electrical Engineering Lab", instructor="Dr. R. K. Mehta", total_sessions=14),
        models.LabCourse(id="c2", code="EC201", title="Analog Electronics Laboratory", instructor="Prof. Ananya Sen", total_sessions=14),
        models.LabCourse(id="c3", code="PH101", title="Engineering Physics Practical", instructor="Dr. S. Bhattacharya", total_sessions=12),
        models.LabCourse(id="c4", code="CS103", title="Scientific Computing & C Lab", instructor="Prof. M. Patel", total_sessions=12),
    ]
    db.add_all(courses)

    # Seed Sessions
    sessions = [
        models.LabSession(
            id="ses-1",
            course_code="EE102",
            subject="Basic Electrical Engineering Lab",
            experiment_title="RC Transient Charging & Discharging Analysis",
            instructor="Dr. R. K. Mehta",
            room="Lab Room 304 (Power Systems Block)",
            start_time="Today, 02:00 PM",
            end_time="04:00 PM",
            status="Upcoming",
            announcement="Calibrated oscilloscopes ready in Stations 1-8.",
            workstations_available=18,
            total_workstations=20
        ),
        models.LabSession(
            id="ses-2",
            course_code="EC201",
            subject="Analog Electronics Laboratory",
            experiment_title="BJT Transistor Biasing & Small Signal Amplification",
            instructor="Prof. Ananya Sen",
            room="Lab Room 208",
            start_time="Tomorrow, 10:00 AM",
            end_time="12:00 PM",
            status="Upcoming",
            workstations_available=20,
            total_workstations=20
        )
    ]
    db.add_all(sessions)

    # Seed Notices
    notices = [
        models.LabNotice(
            id="not-1",
            title="Mid-Semester Practical Examination & Viva Voce Schedule",
            description="Laboratory evaluations commence next week. Review your experiment logs and prepare for oral viva with external examiners.",
            category="Practical Examination",
            date_posted="2026-10-07",
            deadline="2026-10-16",
            priority="High",
            posted_by="Dr. R. K. Mehta",
            attachment_name="MidSem_LabExam_Roster.pdf",
            attachment_size="420 KB"
        )
    ]
    db.add_all(notices)

    # Seed Attendance
    attendance = [
        models.AttendanceRecord(
            id="att-1",
            course_id="c1",
            course_code="EE102",
            course_title="Basic Electrical Engineering Lab",
            date="2026-09-03",
            topic="Ohm's Law Verification",
            status="PRESENT",
            duration_hours=2
        ),
        models.AttendanceRecord(
            id="att-2",
            course_id="c1",
            course_code="EE102",
            course_title="Basic Electrical Engineering Lab",
            date="2026-09-10",
            topic="Series-Parallel Networks",
            status="PRESENT",
            duration_hours=2
        ),
        models.AttendanceRecord(
            id="att-3",
            course_id="c1",
            course_code="EE102",
            course_title="Basic Electrical Engineering Lab",
            date="2026-09-17",
            topic="Kirchhoff's Laws",
            status="PRESENT",
            duration_hours=2
        ),
        models.AttendanceRecord(
            id="att-4",
            course_id="c1",
            course_code="EE102",
            course_title="Basic Electrical Engineering Lab",
            date="2026-09-24",
            topic="Thevenin Theorem",
            status="ABSENT",
            duration_hours=2,
            remarks="Medical Leave"
        )
    ]
    db.add_all(attendance)

    db.commit()
    db.close()
