/**
 * Enhanced Type Definitions for Student Dashboard
 *
 * This file contains additional TypeScript interfaces and types for the
 * student dashboard enhancement features, complementing the base dashboard types.
 */

import type {
  User,
  Course,
  Enrollment,
  Achievement,
  Notification,
  Activity,
  Deadline,
  LearningStreak,
  Bookmark,
  CourseRecommendation,
  LearningStats,
  DashboardStats,
  Grade,
  Certificate,
} from "./dashboard";

/**
 * Component Props Types
 */

export interface PersonalizedOverviewProps {
  user: User;
  enrollments: Enrollment[];
  upcomingDeadlines: Deadline[];
  recentActivity: Activity[];
  achievements: Achievement[];
  onContinueCourse: (courseId: string) => void;
  onViewDeadlines: () => void;
  onViewAchievements: () => void;
}

export interface CourseProgressVisualizationProps {
  enrollments: Enrollment[];
  onContinueCourse: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
}

export interface DeadlinesAndRemindersProps {
  deadlines: Deadline[];
  onSetReminder: (deadlineId: string, reminderTime: Date) => void;
  onViewDeadline: (deadlineId: string) => void;
  onAddReminder: () => void;
}

export interface AchievementProgressTrackingProps {
  achievements: Achievement[];
  learningStreak: LearningStreak;
  learningStats: LearningStats;
  onViewAchievement: (achievementId: string) => void;
  onSetGoal: (goal: WeeklyGoal) => void;
}

export interface NotificationSystemProps {
  userId: string;
  onNotificationClick: (notification: Notification) => void;
  maxVisible?: number;
}

export interface CourseRecommendationProps {
  userId: string;
  userProfile: LearningProfile;
  onApplyCourse: (courseId: string) => void;
  onDismissRecommendation: (courseId: string) => void;
}

export interface LearningAnalyticsProps {
  userId: string;
  timeRange: "week" | "month" | "year" | "all";
  onExportReport: () => void;
}

/**
 * Shared UI Component Props
 */

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: Error;
}

export interface StatWidgetProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color: "blue" | "green" | "orange" | "purple" | "red";
  onClick?: () => void;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

/**
 * Extended Type Definitions
 */

export interface LearningProfile {
  interests: string[];
  goals: string[];
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  preferredLearningStyle: "VISUAL" | "AUDITORY" | "KINESTHETIC" | "READING";
  weeklyGoal: WeeklyGoal;
  onboardingCompleted: boolean;
  timeCommitment?: number; // hours per week
  experience?: string;
  careerGoals?: string;
}

export interface WeeklyGoal {
  target: number;
  current: number;
  unit: "hours" | "lessons" | "assignments";
  startDate: Date;
  endDate: Date;
  achieved: boolean;
}

/**
 * Calculation and Processing Types
 */

export interface DashboardStatistics {
  activeCourses: number;
  averageProgress: number;
  upcomingDeadlines: number;
  achievementsEarned: number;
  totalHours: number;
  completionRate: number;
}

export interface ProgressCalculation {
  enrollmentId: string;
  courseId: string;
  completionPercentage: number;
  timeSpent: number; // in minutes
  estimatedCompletion: number; // in minutes
  lastActivity: Date;
  pace: "ahead" | "on-track" | "behind";
}

export interface GradeTrendData {
  date: Date;
  score: number;
  maxScore: number;
  percentage: number;
  assessmentTitle: string;
  courseId: string;
}

export interface StreakCalculation {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  isActive: boolean;
  daysUntilBreak: number;
}

/**
 * Filtering and Sorting Types
 */

export interface MultiCriteriaFilter {
  status?: string[];
  category?: string[];
  difficulty?: string[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: string[];
}

export interface SortConfiguration {
  field: string;
  order: "asc" | "desc";
  secondaryField?: string;
  secondaryOrder?: "asc" | "desc";
}

/**
 * Recommendation Engine Types
 */

export interface RecommendationCriteria {
  interests: string[];
  completedCourses: string[];
  skillLevel: string;
  timeCommitment: number;
  goals: string[];
}

export interface RecommendationScore {
  courseId: string;
  score: number;
  reasons: string[];
  matchedInterests: string[];
  matchedSkills: string[];
}

/**
 * Analytics and Reporting Types
 */

export interface AnalyticsData {
  totalHours: number;
  averageScore: number;
  skillsLearned: string[];
  completionRate: number;
  coursesCompleted: number;
  coursesInProgress: number;
  assessmentsTaken: number;
  averageTimePerCourse: number;
  mostActiveDay: string;
  learningVelocity: number; // lessons per week
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

/**
 * Real-time and WebSocket Types
 */

export interface WebSocketMessage {
  type: "notification" | "grade" | "deadline" | "message" | "achievement";
  payload: unknown;
  timestamp: Date;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Customization and Preferences Types
 */

export interface DashboardLayout {
  widgets: WidgetConfiguration[];
  sections: SectionConfiguration[];
  theme: "light" | "dark" | "auto";
}

export interface WidgetConfiguration {
  id: string;
  type: string;
  position: number;
  visible: boolean;
  size: "small" | "medium" | "large";
  settings?: Record<string, unknown>;
}

export interface SectionConfiguration {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

/**
 * Error and Loading State Types
 */

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface LoadingStateWithProgress {
  isLoading: boolean;
  progress: number; // 0-100
  stage?: string;
  message?: string;
}

/**
 * Cache and Optimization Types
 */

export interface CacheConfig {
  key: string;
  ttl: number; // time to live in milliseconds
  staleWhileRevalidate: boolean;
}

export interface QueryConfig {
  enabled: boolean;
  refetchOnWindowFocus: boolean;
  refetchInterval?: number;
  staleTime: number;
  cacheTime: number;
}

/**
 * Utility Types
 */

export interface TimeFormat {
  hours: number;
  minutes: number;
  formatted: string;
}

export interface DateRange {
  start: Date;
  end: Date;
  label?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * API Response Types
 */

export interface DashboardDataResponse {
  user: User;
  enrollments: Enrollment[];
  deadlines: Deadline[];
  achievements: Achievement[];
  notifications: Notification[];
  activities: Activity[];
  learningStreak: LearningStreak;
  stats: DashboardStats;
  recommendations: CourseRecommendation[];
}

export interface AnalyticsResponse {
  analytics: AnalyticsData;
  trends: TimeSeriesData[];
  topCourses: Course[];
  recentGrades: Grade[];
}

/**
 * Form and Input Types
 */

export interface GoalFormData {
  target: number;
  unit: "hours" | "lessons" | "assignments";
  startDate: Date;
  endDate: Date;
}

export interface ReminderFormData {
  deadlineId: string;
  reminderTime: Date;
  notificationMethod: "email" | "push" | "sms";
}

export interface PreferencesFormData {
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboardLayout: string[];
}

/**
 * Validation Types
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Export all types
 */

export type {
  User,
  Course,
  Enrollment,
  Achievement,
  Notification,
  Activity,
  Deadline,
  LearningStreak,
  Bookmark,
  CourseRecommendation,
  LearningStats,
  DashboardStats,
  Grade,
  Certificate,
};
