export interface Student {
  id: string;
  name: string;
  rollNumber?: string;
  email?: string;
  present?: boolean;
  marks?: Record<string, number>;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  students: Student[];
  createdAt: Date;
}

export interface Session {
  id: string;
  classId: string;
  topic: string;
  subtopic?: string;
  date: Date;
  attendance: Record<string, boolean>;
  examType?: string;
  marks?: Record<string, number>;
}

export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  present: boolean;
  timestamp: Date;
}