export enum GradeLevel {
  FIRST = 'الصف الأول الثانوي',
  SECOND = 'الصف الثاني الثانوي',
  THIRD = 'الصف الثالث الثانوي',
}

export enum TrackType {
  GENERAL = 'عام',
  SCIENTIFIC = 'علمي',
  SCIENTIFIC_MATH = 'علمي رياضة',
  SCIENTIFIC_SCIENCE = 'علمي علوم',
  LITERARY = 'أدبي',
}

export interface PaymentStatus {
  month: string; // e.g., '2026-09' for September 2026
  status: 'paid' | 'unpaid' | 'partial';
  amountPaid: number;
  totalRequired: number;
  paidAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  maxScore: number;
  gradeLevel: GradeLevel;
  createdBy?: string;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  notes?: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  gradeLevel: GradeLevel;
  track: TrackType;
  phone: string;
  parentPhone: string;
  school: string;
  payments: { [month: string]: PaymentStatus }; // Key is month string 'YYYY-MM'
  attendance: { [date: string]: AttendanceRecord }; // Key is date string 'YYYY-MM-DD'
  examResults: { [examId: string]: number }; // Key is examId, value is score
  notes: string;
  createdAt: string;
  createdBy?: string;
}
