/**
 * VirtuLab AI - Local Storage & Data Store
 * Manages demonstration records for attendance, notices, sessions, viva history,
 * and user profile without inventing statistics.
 */

import {
  UserProfile,
  UserRole,
  LabCourse,
  AttendanceRecord,
  LabSession,
  LabNotice,
  VivaSessionRecord,
  ExperimentAttemptRecord
} from '../types/app';

const KEYS = {
  USER_PROFILE: 'virtulab_user_profile',
  COURSES: 'virtulab_courses',
  ATTENDANCE: 'virtulab_attendance',
  SESSIONS: 'virtulab_sessions',
  NOTICES: 'virtulab_notices',
  VIVA_HISTORY: 'virtulab_viva_history',
  ATTEMPTS: 'virtulab_attempts'
};

// Initial Seed Data (clearly identified as Demo Data)
const SEED_PROFILE: UserProfile = {
  id: 'usr-demo-01',
  name: 'Aarav Sharma',
  rollNumber: '22EE1042',
  email: 'aarav.sharma@engg.edu',
  role: 'student',
  batch: 'EE-2024 / Sec-B'
};

const SEED_COURSES: LabCourse[] = [
  { id: 'c1', code: 'EE102', title: 'Basic Electrical Engineering Lab', instructor: 'Dr. R. K. Mehta', totalSessions: 14 },
  { id: 'c2', code: 'EC201', title: 'Analog Electronics Laboratory', instructor: 'Prof. Ananya Sen', totalSessions: 14 },
  { id: 'c3', code: 'PH101', title: 'Engineering Physics Practical', instructor: 'Dr. S. Bhattacharya', totalSessions: 12 },
  { id: 'c4', code: 'CS103', title: 'Scientific Computing & C Lab', instructor: 'Prof. M. Patel', totalSessions: 12 }
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', courseId: 'c1', courseCode: 'EE102', courseTitle: 'Basic Electrical Engineering Lab', date: '2026-09-03', topic: "Ohm's Law & Verification", status: 'PRESENT', durationHours: 2 },
  { id: 'att-2', courseId: 'c1', courseCode: 'EE102', courseTitle: 'Basic Electrical Engineering Lab', date: '2026-09-10', topic: 'Series-Parallel Resistor Networks', status: 'PRESENT', durationHours: 2 },
  { id: 'att-3', courseId: 'c1', courseCode: 'EE102', courseTitle: 'Basic Electrical Engineering Lab', date: '2026-09-17', topic: 'Kirchhoff’s Laws (KVL & KCL)', status: 'PRESENT', durationHours: 2 },
  { id: 'att-4', courseId: 'c1', courseCode: 'EE102', courseTitle: 'Basic Electrical Engineering Lab', date: '2026-09-24', topic: 'Thevenin’s Theorem', status: 'ABSENT', durationHours: 2, remarks: 'Medical Leave' },
  { id: 'att-5', courseId: 'c1', courseCode: 'EE102', courseTitle: 'Basic Electrical Engineering Lab', date: '2026-10-01', topic: 'Maximum Power Transfer Theorem', status: 'PRESENT', durationHours: 2 },
  { id: 'att-6', courseId: 'c2', courseCode: 'EC201', courseTitle: 'Analog Electronics Laboratory', date: '2026-09-05', topic: 'PN Junction Diode V-I Characteristics', status: 'PRESENT', durationHours: 2 },
  { id: 'att-7', courseId: 'c2', courseCode: 'EC201', courseTitle: 'Analog Electronics Laboratory', date: '2026-09-12', topic: 'Zener Diode as Voltage Regulator', status: 'PRESENT', durationHours: 2 },
  { id: 'att-8', courseId: 'c2', courseCode: 'EC201', courseTitle: 'Analog Electronics Laboratory', date: '2026-09-19', topic: 'BJT Common Emitter Characteristics', status: 'PRESENT', durationHours: 2 },
  { id: 'att-9', courseId: 'c2', courseCode: 'EC201', courseTitle: 'Analog Electronics Laboratory', date: '2026-09-26', topic: 'RC Low Pass and High Pass Filters', status: 'ABSENT', durationHours: 2 },
  { id: 'att-10', courseId: 'c3', courseCode: 'PH101', courseTitle: 'Engineering Physics Practical', date: '2026-09-08', topic: 'Newton’s Rings Experiment', status: 'PRESENT', durationHours: 2 },
  { id: 'att-11', courseId: 'c3', courseCode: 'PH101', courseTitle: 'Engineering Physics Practical', date: '2026-09-15', topic: 'Diffraction Grating (Laser Wavelength)', status: 'PRESENT', durationHours: 2 },
  { id: 'att-12', courseId: 'c4', courseCode: 'CS103', courseTitle: 'Scientific Computing & C Lab', date: '2026-09-09', topic: 'Arrays & Dynamic Memory Allocation', status: 'PRESENT', durationHours: 2 },
  { id: 'att-13', courseId: 'c4', courseCode: 'CS103', courseTitle: 'Scientific Computing & C Lab', date: '2026-09-16', topic: 'Linked List Implementation', status: 'PRESENT', durationHours: 2 }
];

const SEED_SESSIONS: LabSession[] = [
  {
    id: 'ses-1',
    courseCode: 'EE102',
    subject: 'Basic Electrical Engineering Lab',
    experimentTitle: 'RC Transient Charging & Discharging Analysis',
    instructor: 'Dr. R. K. Mehta',
    room: 'Lab Room 304 (Power Systems Block)',
    startTime: 'Today, 02:00 PM',
    endTime: '04:00 PM',
    status: 'Upcoming',
    announcement: 'Bring your pre-lab calculation sheets. Digital oscilloscopes will be calibrated in Station 4-8.',
    workstationsAvailable: 18,
    totalWorkstations: 20
  },
  {
    id: 'ses-2',
    courseCode: 'EC201',
    subject: 'Analog Electronics Laboratory',
    experimentTitle: 'BJT Transistor Biasing & Small Signal Amplification',
    instructor: 'Prof. Ananya Sen',
    room: 'Lab Room 208 (Semiconductor Wing)',
    startTime: 'Tomorrow, 10:00 AM',
    endTime: '12:00 PM',
    status: 'Upcoming',
    announcement: 'Review h-parameter model theory beforehand.',
    workstationsAvailable: 20,
    totalWorkstations: 20
  },
  {
    id: 'ses-3',
    courseCode: 'PH101',
    subject: 'Engineering Physics Practical',
    experimentTitle: 'Hall Effect Sensor Setup & Carrier Density',
    instructor: 'Dr. S. Bhattacharya',
    room: 'Physics Lab 102',
    startTime: 'Thursday, 02:00 PM',
    endTime: '04:00 PM',
    status: 'Upcoming',
    workstationsAvailable: 15,
    totalWorkstations: 16
  }
];

const SEED_NOTICES: LabNotice[] = [
  {
    id: 'not-1',
    title: 'Mid-Semester Practical Examination & Viva Voce Schedule',
    description: 'The mid-semester laboratory evaluation for EE102 and EC201 will commence next week. All students must present signed lab records and prepare for a 10-minute viva with external examiners.',
    category: 'Practical Examination',
    datePosted: '2026-10-07',
    deadline: '2026-10-16',
    priority: 'High',
    postedBy: 'Dr. R. K. Mehta (Head of Lab Operations)',
    attachmentName: 'MidSem_LabExam_Roster_Fall2026.pdf',
    attachmentSize: '420 KB'
  },
  {
    id: 'not-2',
    title: 'Lab Manual Revision: Experiment 7 (RC Transient Analysis)',
    description: 'Updated apparatus list and safety warnings for the RC transient response experiment have been uploaded. Download the revised instruction sheet before your next session.',
    category: 'Lab Manual Upload',
    datePosted: '2026-10-06',
    priority: 'Medium',
    postedBy: 'Dept. of Electrical Engineering',
    attachmentName: 'Exp7_RC_Transient_Manual_v2.pdf',
    attachmentSize: '1.2 MB'
  },
  {
    id: 'not-3',
    title: 'Strict Laboratory Safety Notice: High Current Precautions',
    description: 'Never adjust supply voltage while maintaining short-circuit conditions. Always verify grounding lugs before energizing transformer benches. Wear insulating rubber footwear.',
    category: 'Safety Notice',
    datePosted: '2026-10-02',
    priority: 'High',
    postedBy: 'Central Safety Committee'
  },
  {
    id: 'not-4',
    title: 'Submission Deadline for Exp 1-3 Digital Simulation Records',
    description: 'All VirtuLab AI simulation experiment logs and mistake-correction reflections for Ohm’s Law, Series, and Parallel networks must be submitted by 5:00 PM Friday.',
    category: 'Experiment Deadline',
    datePosted: '2026-09-30',
    deadline: '2026-10-10',
    priority: 'Medium',
    postedBy: 'Prof. Ananya Sen'
  }
];

const SEED_ATTEMPTS: ExperimentAttemptRecord[] = [
  {
    id: 'att-ohm-01',
    experimentId: 'ohms-law',
    experimentTitle: "Verification of Ohm's Law",
    timestamp: Date.now() - 86400000 * 2,
    timeSpentSeconds: 420,
    isCompleted: true,
    mistakesCount: 1,
    correctedMistakesCount: 1,
    stepsCompleted: 4,
    totalSteps: 4,
    finalReadings: { voltage: 10, current: 0.1, resistance: 100, power: 1.0 }
  },
  {
    id: 'att-series-01',
    experimentId: 'series-circuit',
    experimentTitle: "Series Resistor Network",
    timestamp: Date.now() - 86400000,
    timeSpentSeconds: 610,
    isCompleted: true,
    mistakesCount: 2,
    correctedMistakesCount: 2,
    stepsCompleted: 3,
    totalSteps: 3,
    finalReadings: { voltage: 12, current: 0.04, resistance: 300, power: 0.48 }
  }
];

const SEED_VIVA: VivaSessionRecord[] = [
  {
    id: 'viva-init-1',
    timestamp: Date.now() - 86400000,
    subject: 'Basic Electrical Engineering',
    experimentId: 'ohms-law',
    experimentTitle: "Verification of Ohm's Law",
    difficulty: 'Intermediate',
    totalQuestions: 3,
    completedQuestions: 3,
    averageScore: 8.3,
    items: [
      {
        questionNumber: 1,
        question: "State Ohm's Law and identify the constant conditions.",
        studentAnswer: "Ohm's law says V = I * R. Voltage is proportional to current at constant temperature.",
        evaluation: {
          score: 8.5,
          correctConcepts: ['Stated mathematical formula V=IR', 'Mentioned constant temperature condition'],
          missingConcepts: ['Mentioning other physical properties like strain and material purity'],
          incorrectStatements: [],
          modelAnswer: "Current through a conductor is directly proportional to the potential difference across it provided temperature and other physical conditions remain constant.",
          explanation: "Accurate and concise response."
        }
      }
    ],
    strongConcepts: ["Ohm's Law proportionality", "Temperature invariance"],
    conceptsToRevise: ["Ammeter series internal resistance impact"]
  }
];

// Helper to safely fetch from localStorage with seed fallback
function getStored<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to storage', e);
  }
}

export const StorageService = {
  getUserProfile(): UserProfile {
    return getStored<UserProfile>(KEYS.USER_PROFILE, SEED_PROFILE);
  },
  setUserProfile(profile: UserProfile): void {
    setStored(KEYS.USER_PROFILE, profile);
  },
  toggleRole(): UserRole {
    const current = this.getUserProfile();
    const newRole: UserRole = current.role === 'student' ? 'instructor' : 'student';
    const updated: UserProfile = {
      ...current,
      role: newRole,
      name: newRole === 'instructor' ? 'Dr. Rajesh K. Mehta' : 'Aarav Sharma',
      rollNumber: newRole === 'instructor' ? 'FAC-EE-08' : '22EE1042'
    };
    this.setUserProfile(updated);
    return newRole;
  },

  getCourses(): LabCourse[] {
    return getStored<LabCourse[]>(KEYS.COURSES, SEED_COURSES);
  },

  getAttendance(): AttendanceRecord[] {
    return getStored<AttendanceRecord[]>(KEYS.ATTENDANCE, SEED_ATTENDANCE);
  },
  addAttendance(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const all = this.getAttendance();
    const newRec: AttendanceRecord = { ...record, id: `att-${Date.now()}` };
    all.unshift(newRec);
    setStored(KEYS.ATTENDANCE, all);
    return newRec;
  },

  getSessions(): LabSession[] {
    return getStored<LabSession[]>(KEYS.SESSIONS, SEED_SESSIONS);
  },
  updateSessionStatus(sessionId: string, status: LabSession['status'], announcement?: string): void {
    const sessions = this.getSessions().map(s => {
      if (s.id === sessionId) {
        return { ...s, status, announcement: announcement !== undefined ? announcement : s.announcement };
      }
      return s;
    });
    setStored(KEYS.SESSIONS, sessions);
  },
  addSession(session: Omit<LabSession, 'id'>): LabSession {
    const sessions = this.getSessions();
    const newSession: LabSession = { ...session, id: `ses-${Date.now()}` };
    sessions.unshift(newSession);
    setStored(KEYS.SESSIONS, sessions);
    return newSession;
  },

  getNotices(): LabNotice[] {
    return getStored<LabNotice[]>(KEYS.NOTICES, SEED_NOTICES);
  },
  addNotice(notice: Omit<LabNotice, 'id' | 'datePosted'>): LabNotice {
    const all = this.getNotices();
    const newNotice: LabNotice = {
      ...notice,
      id: `not-${Date.now()}`,
      datePosted: new Date().toISOString().split('T')[0]
    };
    all.unshift(newNotice);
    setStored(KEYS.NOTICES, all);
    return newNotice;
  },
  deleteNotice(id: string): void {
    const all = this.getNotices().filter(n => n.id !== id);
    setStored(KEYS.NOTICES, all);
  },

  getAttempts(): ExperimentAttemptRecord[] {
    return getStored<ExperimentAttemptRecord[]>(KEYS.ATTEMPTS, SEED_ATTEMPTS);
  },
  recordAttempt(attempt: Omit<ExperimentAttemptRecord, 'id' | 'timestamp'>): ExperimentAttemptRecord {
    const attempts = this.getAttempts();
    const newAttempt: ExperimentAttemptRecord = {
      ...attempt,
      id: `att-exp-${Date.now()}`,
      timestamp: Date.now()
    };
    attempts.unshift(newAttempt);
    setStored(KEYS.ATTEMPTS, attempts);
    return newAttempt;
  },

  getVivaSessions(): VivaSessionRecord[] {
    return getStored<VivaSessionRecord[]>(KEYS.VIVA_HISTORY, SEED_VIVA);
  },
  saveVivaSession(session: VivaSessionRecord): void {
    const sessions = this.getVivaSessions();
    sessions.unshift(session);
    setStored(KEYS.VIVA_HISTORY, sessions);
  },

  resetAllDemoData(): void {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(SEED_PROFILE));
    localStorage.setItem(KEYS.COURSES, JSON.stringify(SEED_COURSES));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(SEED_SESSIONS));
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(SEED_NOTICES));
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(SEED_ATTEMPTS));
    localStorage.setItem(KEYS.VIVA_HISTORY, JSON.stringify(SEED_VIVA));
  }
};
