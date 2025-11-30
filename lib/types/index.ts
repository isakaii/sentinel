// Core type definitions for Sentinel

export type CourseColor =
  | "cardinal"
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "pink"
  | "indigo"
  | "teal";

export type EventType = "assignment" | "exam" | "quiz" | "reading" | "important_date";

export interface Course {
  id: string;
  userId: string;
  courseName: string;
  courseCode: string;
  color: CourseColor;
  instructor?: string;
  term?: string;
  syllabusUrl?: string;
  syllabusUploaded: boolean;
  eventsExtracted: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  courseId: string;
  userId: string;
  type: EventType;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  points?: number;
  submissionMethod?: string;
  coverage?: string;
  completed: boolean;
  syncedToCalendar: boolean;
  googleCalendarEventId?: string;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type NotificationTiming = '1_day' | '3_days' | '1_week';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  googleCalendarConnected: boolean;
  themePreference: ThemePreference;
  notificationTiming: NotificationTiming[];
  createdAt: string;
}

export interface DashboardStats {
  totalCourses: number;
  totalEvents: number;
  upcomingDeadlines: number;
  completedEvents: number;
}
