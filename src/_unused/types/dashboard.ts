/**
 * Type definitions for Student Dashboard
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the student dashboard enhancement features.
 */

/**
 * User and Profile Types
 */

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type LearningStyle = "VISUAL" | "AUDITORY" | "KINESTHETIC" | "READING";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  learningProfile?: LearningProfile;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningProfile {
  interests: string[];
  goals: string[];
  skillLevel: SkillLevel;
  preferredLearningStyle: LearningStyle;
  weeklyGoal: {
    target: number;
    unit: "hours" | "lessons" | "assignments";
  };
  onboardingCompleted: boolean;
}

export interface UserPreferences {
  dashboardLayout?: DashboardWidget[];
  notificationSettings?: NotificationSettings;
  theme?: "light" | "dark" | "auto";
  language?: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  order: number;
  visible: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  assignments: boolean;
  grades: boolean;
  deadlines: boolean;
  messages: boolean;
  achievements: boolean;
}

/**
 * Course and Enrollment Types
 */

export type CourseStatus = "ACTIVE" | "COMPLETED" | "SUSPENDED";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number; // in hours
  color?: string;
  thumbnail?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  status: CourseStatus;
  progress: number; // 0-100
  currentLesson?: string;
  timeSpent: number; // in minutes
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  certificates?: Certificate[];
  grades?: Grade[];
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  issuedAt: Date;
  certificateUrl: string;
}

export interface Grade {
  id: string;
  enrollmentId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  gradedAt: Date;
}

/**
 * Deadline and Assignment Types
 */

export type DeadlineType =
  | "assignment"
  | "quiz"
  | "project"
  | "exam"
  | "discussion";

export type DeadlineStatus = "pending" | "submitted" | "overdue" | "completed";

export type Priority = "low" | "medium" | "high";

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  courseId: string;
  course: {
    id: string;
    title: string;
    color: string;
  };
  type: DeadlineType;
  priority: Priority;
  status: DeadlineStatus;
  estimatedTime: number; // in minutes
  reminderSet: boolean;
  reminderTime?: Date;
}

/**
 * Achievement and Gamification Types
 */

export type AchievementCategory =
  | "learning"
  | "engagement"
  | "milestone"
  | "special";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: Rarity;
  points: number;
  earnedDate: Date;
  progress?: {
    current: number;
    total: number;
    unit: string;
  };
}

export interface LearningStreak {
  userId: string;
  current: number; // current streak in days
  longest: number; // longest streak ever
  lastActivity: Date;
  streakHistory: StreakEntry[];
}

export interface StreakEntry {
  date: Date;
  activitiesCompleted: number;
}

/**
 * Notification Types
 */

export type NotificationType =
  | "assignment"
  | "grade"
  | "deadline"
  | "message"
  | "achievement"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Activity Types
 */

export type ActivityType =
  | "lesson_completed"
  | "assignment_submitted"
  | "quiz_taken"
  | "course_enrolled"
  | "achievement_earned";

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  courseId?: string;
  courseName?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Recommendation Types
 */

export interface CourseRecommendation {
  courseId: string;
  course: Course;
  relevanceScore: number; // 0-100
  reason: string;
  matchedInterests: string[];
  matchedSkills: string[];
  dismissedAt?: Date;
}

/**
 * Analytics Types
 */

export interface LearningStats {
  totalHours: number;
  averageScore: number;
  skillsLearned: string[];
  completionRate: number;
  coursesCompleted: number;
  coursesInProgress: number;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  label: "week" | "month" | "year" | "all";
}

/**
 * Bookmark Types
 */

export interface Bookmark {
  id: string;
  userId: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseName: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Dashboard Statistics Types
 */

export interface DashboardStats {
  activeCourses: number;
  averageProgress: number;
  upcomingDeadlines: number;
  achievementsEarned: number;
}

/**
 * Filter and Sort Types
 */

export interface FilterOptions {
  status?: CourseStatus | DeadlineStatus;
  category?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  search?: string;
  type?: ActivityType | DeadlineType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export type SortField =
  | "date"
  | "priority"
  | "title"
  | "progress"
  | "dueDate"
  | "course"
  | "timestamp"
  | "earnedDate";

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

/**
 * Goal Tracking Types
 */

export interface WeeklyGoal {
  target: number;
  current: number;
  unit: "hours" | "lessons" | "assignments";
  startDate: Date;
  endDate: Date;
  achieved: boolean;
}

/**
 * Reminder Types
 */

export interface Reminder {
  id: string;
  deadlineId: string;
  userId: string;
  reminderTime: Date;
  notificationSent: boolean;
  createdAt: Date;
}

/**
 * Progress Calculation Types
 */

export interface ProgressCalculation {
  enrollmentId: string;
  completionPercentage: number;
  timeSpent: number; // in minutes
  estimatedCompletion: number; // in minutes
  lastActivity: Date;
}

/**
 * Grade Trend Types
 */

export interface GradeTrend {
  date: Date;
  score: number;
  assessmentTitle: string;
  courseId: string;
}

/**
 * Message Preview Types
 */

export interface MessagePreview {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  preview: string; // First N characters
  timestamp: Date;
  read: boolean;
}

/**
 * Customization Types
 */

export interface DashboardCustomization {
  userId: string;
  widgetOrder: string[]; // Array of widget IDs in order
  visibleSections: Record<string, boolean>;
  preferences: Record<string, unknown>;
  lastUpdated: Date;
}

/**
 * Error Types
 */

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  retryAction?: () => void;
}

/**
 * Loading State Types
 */

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

/**
 * Cache Types
 */

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Optimistic Update Types
 */

export interface OptimisticUpdate<T> {
  id: string;
  type: "create" | "update" | "delete";
  data: T;
  previousData?: T;
  timestamp: Date;
}

/**
 * WebSocket Event Types
 */

export type WebSocketEventType =
  | "notification"
  | "grade_posted"
  | "assignment_posted"
  | "deadline_reminder"
  | "message_received"
  | "achievement_unlocked";

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: Date;
}

/**
 * Pagination Types
 */

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * API Response Types
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Time Formatting Types
 */

export interface FormattedTime {
  hours: number;
  minutes: number;
  formatted: string; // e.g., "2h 30m"
}

/**
 * Greeting Types
 */

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface PersonalizedGreeting {
  greeting: string; // e.g., "Good morning"
  userName: string;
  fullGreeting: string; // e.g., "Good morning, John!"
  timeOfDay: TimeOfDay;
}
