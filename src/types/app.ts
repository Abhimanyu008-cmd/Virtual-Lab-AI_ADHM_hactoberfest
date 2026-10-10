/**
 * VirtuLab AI - Application Domain Types
 */

export type UserRole = 'student' | 'instructor';

export interface UserProfile {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  role: UserRole;
  batch: string;
  avatarUrl?: string;
}

export interface LabCourse {
  id: string;
  code: string;
  title: string;
  instructor: string;
  totalSessions: number;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  topic: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  durationHours: number;
  remarks?: string;
}

export type LabSessionStatus = 'Upcoming' | 'Ongoing' | 'Delayed' | 'Cancelled' | 'Completed';

export interface LabSession {
  id: string;
  courseCode: string;
  subject: string;
  experimentTitle: string;
  instructor: string;
  room: string;
  startTime: string; // e.g. "Today, 02:00 PM"
  endTime: string;
  status: LabSessionStatus;
  announcement?: string;
  workstationsAvailable: number;
  totalWorkstations: number;
}

export type NoticeCategory = 
  | 'Lab Announcement'
  | 'Experiment Deadline'
  | 'Practical Examination'
  | 'Viva Schedule'
  | 'Lab Manual Upload'
  | 'Equipment Availability'
  | 'Safety Notice';

export type NoticePriority = 'High' | 'Medium' | 'Low';

export interface LabNotice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  datePosted: string;
  deadline?: string;
  priority: NoticePriority;
  postedBy: string;
  attachmentName?: string;
  attachmentSize?: string;
}

export type VivaDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface VivaQuestionEvaluation {
  score: number; // 0 to 10
  correctConcepts: string[];
  missingConcepts: string[];
  incorrectStatements: string[];
  modelAnswer: string;
  explanation: string;
  followUpQuestion?: string;
}

export interface VivaSessionItem {
  questionNumber: number;
  question: string;
  studentAnswer: string;
  evaluation?: VivaQuestionEvaluation;
}

export interface VivaSessionRecord {
  id: string;
  timestamp: number;
  subject: string;
  experimentId: string;
  experimentTitle: string;
  difficulty: VivaDifficulty;
  totalQuestions: number;
  completedQuestions: number;
  averageScore: number;
  items: VivaSessionItem[];
  strongConcepts: string[];
  conceptsToRevise: string[];
}

export interface ExperimentAttemptRecord {
  id: string;
  experimentId: string;
  experimentTitle: string;
  timestamp: number;
  timeSpentSeconds: number;
  isCompleted: boolean;
  mistakesCount: number;
  correctedMistakesCount: number;
  stepsCompleted: number;
  totalSteps: number;
  finalReadings?: {
    voltage: number;
    current: number;
    resistance: number;
    power: number;
  };
}

export interface OllamaConfig {
  endpoint: string; // e.g. "http://localhost:11434"
  model: string;    // e.g. "gemma3:4b"
  timeoutMs: number;
}

export interface OllamaStatus {
  isConnected: boolean;
  availableModels: string[];
  currentModel: string;
  lastChecked: number;
  errorMessage?: string;
}
