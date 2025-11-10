// Recycle Bin
export type { DeletedItem } from './recycle-bin';

// User & Authentication
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'teacher' | 'admin' | 'principal';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// School
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Student
export interface Student {
  id: string;
  name: string;
  rollNumber?: string;
  registrationNumber?: string;
  examIndexNumber?: string;
  email?: string;
  phone?: string;
  parent_phone?: string;
  address?: string;
  photo_url?: string;
  class_id: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  present?: boolean;
  marks?: Record<string, number>;
  group?: string;
}

// Education Levels and Class Types
export type EducationLevel = 'primary' | 'secondary' | 'advanced';
export type ClassType = 'academic' | 'extracurricular';
export type PrimaryClass = 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' | 'Class 6';
export type SecondaryForm = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';
export type AdvancedForm = 'Form 5' | 'Form 6';
export type StreamSuffix = 'A' | 'B' | 'C' | 'D' | 'E';
export type AdvancedCombination = 'PCB' | 'PCM' | 'PGM' | 'HGL' | 'HKL' | 'EGM' | 'CBG' | 'Custom';

// Extracurricular Categories
export type ExtracurricularCategory = 'sports' | 'academic' | 'arts' | 'leadership' | 'community' | 'technology';

export interface ExtracurricularClub {
  id: string;
  name: string;
  category: ExtracurricularCategory;
  description?: string;
  teacher_id?: string;
  school_id?: string;
  meeting_schedule?: string;
  created_at?: string;
  updated_at?: string;
  students?: Student[];
}

// Class
export interface Class {
  id: string;
  name: string;
  subject: string;
  education_level: EducationLevel;
  class_type: ClassType;
  base_class?: PrimaryClass | SecondaryForm | AdvancedForm;
  stream?: StreamSuffix;
  combination?: AdvancedCombination;
  custom_combination?: string;
  school_id?: string;
  teacher_id?: string;
  created_at?: string;
  updated_at?: string;
  // Related data (populated separately)
  students?: Student[];
  assignments?: Assignment[];
  exams?: Exam[];
  // Legacy field
  createdAt?: Date;
}

// Session
export interface Session {
  id: string;
  classId: string;
  topic: string;
  subtopic?: string;
  date: Date | string;
  examType?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy attendance format (for backward compatibility)
  attendance?: Record<string, boolean | AttendanceStatus>;
  marks?: Record<string, number>;
}

// Attendance Status with reasons
export interface AttendanceStatus {
  present: boolean;
  reason?: 'sick' | 'permitted' | 'other' | null;
  note?: string;
}

// Teacher Profile
export interface TeacherProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  school?: string;
  educationLevel: string;
  subjects: string[];
  experience?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

// Attendance Record (normalized)
export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  present: boolean;
  timestamp?: string;
  // Legacy fields
  sessionId?: string;
  studentId?: string;
}

// Exam
export interface Exam {
  id: string;
  title: string;
  description?: string;
  class_id: string;
  date: Date | string;
  max_score: number;
  pdf_url?: string;
  pdf_filename?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  classId?: string;
  maxScore?: number;
  scores?: Record<string, number>;
}

// Exam Result (normalized)
export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

// Assignment
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  class_id: string;
  due_date: Date | string;
  max_points?: number;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  classId?: string;
  dueDate?: Date;
  submissions?: Record<string, {
    submitted: boolean;
    grade?: number;
    submittedAt?: Date;
  }>;
}

// Assignment Submission (normalized)
export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted: boolean;
  submitted_at?: string;
  grade?: number;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

// Import/Export Types
export interface ImportConfig {
  sheets: Array<{
    name: string;
    targetEntity: 'students' | 'attendance' | 'exams' | 'assignments';
    fieldMapping: Record<string, string>;
    skipRows?: number;
  }>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

// PDF Types
export interface PDFDocument {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

// Analytics Types
export interface AttendanceAnalytics {
  total_sessions: number;
  average_attendance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  by_student: Record<string, {
    present: number;
    absent: number;
    percentage: number;
  }>;
}

export interface ExamAnalytics {
  total_exams: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  distribution: Record<string, number>;
}