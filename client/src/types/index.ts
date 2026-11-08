export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  fullName: string;
  collegeName?: string;
  course?: string;
  semester?: number;
  academicYear?: string;
  avatarUrl?: string;
  bio?: string;
  planTier: 'free' | 'plus' | 'pro';
  aiQueriesUsedToday: number;
  aiQueriesLimit: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  professor?: string;
  color: string;
  semester: number;
  target_attendance_pct?: number;
  total_classes?: number;
  attended_classes?: number;
  percentage?: number;
  canBunk?: number;
  mustAttend?: number;
  status?: 'safe' | 'warning' | 'critical';
}

export interface TimetableSlot {
  id: string;
  subject_id: string;
  subject_name: string;
  subject_code?: string;
  subject_color?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  building?: string;
  instructor?: string;
  professor?: string;
}

export interface Examination {
  id: string;
  subject_id: string;
  subject_name: string;
  subject_code?: string;
  subject_color?: string;
  exam_name: string;
  exam_date: string;
  start_time?: string;
  duration_minutes: number;
  room_number?: string;
  syllabus_topics?: string;
  target_score?: number;
  is_completed: boolean | number;
  daysRemaining?: number;
  daysLeft?: number;
  isPast?: boolean;
  isUrgent?: boolean;
}

export interface Assignment {
  id: string;
  subject_id?: string;
  subject_name?: string;
  subject_color?: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  submission_link?: string;
  hoursLeft?: number;
  daysLeft?: number;
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

export interface StudyGoal {
  id: string;
  subject_id?: string;
  subject_name?: string;
  subject_color?: string;
  title: string;
  target_date: string;
  target_hours: number;
  completed_hours: number;
  is_completed: boolean | number;
}

export interface StudySession {
  id: string;
  subject_id?: string;
  subject_name?: string;
  subject_color?: string;
  session_type: string;
  duration_minutes: number;
  notes?: string;
  session_date: string;
}

export interface GradeItem {
  id: string;
  semester: number;
  subject_name: string;
  credits: number;
  grade_letter: string;
  grade_points: number;
}

export interface SemesterData {
  semester: number;
  subjects: GradeItem[];
  totalPoints: number;
  totalCredits: number;
  sgpa: number;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  category: 'food' | 'books' | 'transport' | 'hostel' | 'entertainment' | 'other';
  description: string;
  date: string;
  payment_mode: string;
}

export interface NoteItem {
  id: string;
  subject_id?: string;
  subject_name?: string;
  subject_color?: string;
  title: string;
  content: string;
  tags?: string;
  is_favorite: boolean | number;
  updated_at: string;
}

export interface SharedResource {
  id: string;
  subject_name: string;
  title: string;
  category: 'notes' | 'pyq' | 'lab_code' | 'cheat_sheet';
  file_url: string;
  file_size: string;
  description: string;
  upvotes: number;
  reports_count: number;
  status: 'approved' | 'pending' | 'flagged';
  created_at: string;
  author_name?: string;
  author_college?: string;
}

export interface NotificationItem {
  id: string;
  type: 'assignment' | 'exam' | 'attendance' | 'study' | 'system';
  title: string;
  message: string;
  is_read: boolean | number;
  link?: string;
  created_at: string;
}

export interface PlanTier {
  id: 'free' | 'plus' | 'pro';
  name: string;
  price: number;
  priceLabel: string;
  dailyAiLimit: number;
  features: string[];
}
