# Student Dashboard Data Models and TypeScript Interfaces

This directory contains all TypeScript type definitions for the Student Dashboard Enhancement project.

## File Structure

- **`dashboard.ts`** - Base dashboard types including User, Course, Enrollment, Deadline, Achievement, Notification, Activity, and related types
- **`dashboard-enhanced.ts`** - Enhanced types for advanced dashboard features including component props, analytics, recommendations, and customization
- **`index.ts`** - Central export point for all types

## Core Data Models

### User and Profile

```typescript
interface User {
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

interface LearningProfile {
  interests: string[];
  goals: string[];
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  preferredLearningStyle: "VISUAL" | "AUDITORY" | "KINESTHETIC" | "READING";
  weeklyGoal: WeeklyGoal;
  onboardingCompleted: boolean;
}
```

### Course and Enrollment

```typescript
interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED";
  progress: number; // 0-100
  currentLesson?: string;
  timeSpent: number; // in minutes
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  certificates?: Certificate[];
  grades?: Grade[];
}
```

### Deadlines and Assignments

```typescript
interface Deadline {
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
  type: "assignment" | "quiz" | "project" | "exam" | "discussion";
  priority: "low" | "medium" | "high";
  status: "pending" | "submitted" | "overdue" | "completed";
  estimatedTime: number; // in minutes
  reminderSet: boolean;
  reminderTime?: Date;
}
```

### Achievements and Gamification

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "engagement" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  earnedDate: Date;
  progress?: {
    current: number;
    total: number;
    unit: string;
  };
}

interface LearningStreak {
  userId: string;
  current: number; // current streak in days
  longest: number; // longest streak ever
  lastActivity: Date;
  streakHistory: StreakEntry[];
}
```

### Notifications

```typescript
interface Notification {
  id: string;
  userId: string;
  type:
    | "assignment"
    | "grade"
    | "deadline"
    | "message"
    | "achievement"
    | "system";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}
```

### Activity Tracking

```typescript
interface Activity {
  id: string;
  userId: string;
  type:
    | "lesson_completed"
    | "assignment_submitted"
    | "quiz_taken"
    | "course_enrolled"
    | "achievement_earned";
  title: string;
  description: string;
  courseId?: string;
  courseName?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
```

### Course Recommendations

```typescript
interface CourseRecommendation {
  courseId: string;
  course: Course;
  relevanceScore: number; // 0-100
  reason: string;
  matchedInterests: string[];
  matchedSkills: string[];
  dismissedAt?: Date;
}
```

### Analytics

```typescript
interface LearningStats {
  totalHours: number;
  averageScore: number;
  skillsLearned: string[];
  completionRate: number;
  coursesCompleted: number;
  coursesInProgress: number;
}

interface AnalyticsData {
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
```

## Component Props Types

All React component prop interfaces are defined in `dashboard-enhanced.ts`:

- `PersonalizedOverviewProps`
- `CourseProgressVisualizationProps`
- `DeadlinesAndRemindersProps`
- `AchievementProgressTrackingProps`
- `NotificationSystemProps`
- `CourseRecommendationProps`
- `LearningAnalyticsProps`

## Utility Types

### Filtering and Sorting

```typescript
interface FilterOptions {
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

interface SortOptions {
  field: SortField;
  order: "asc" | "desc";
}
```

### API Responses

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
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
```

### Error and Loading States

```typescript
interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  retryAction?: () => void;
}

interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}
```

## Prisma Schema Extensions

The following models have been added to the Prisma schema:

### LearningStreak

Tracks student learning streaks and activity history.

```prisma
model LearningStreak {
  id              String   @id @default(cuid())
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActivityAt  DateTime @default(now())
  streakHistory   Json     @default("[]")
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
}
```

### Bookmark

Stores student bookmarks for lessons and resources.

```prisma
model Bookmark {
  id          String   @id @default(cuid())
  lessonId    String
  lessonTitle String
  courseId    String
  courseName  String
  metadata    Json?
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, lessonId])
}
```

### DashboardActivity

Tracks all student activities for the activity feed.

```prisma
model DashboardActivity {
  id          String   @id @default(cuid())
  type        String
  title       String
  description String
  courseId    String?
  courseName  String?
  metadata    Json?
  timestamp   DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, timestamp])
}
```

### CourseRecommendation

Stores personalized course recommendations for students.

```prisma
model CourseRecommendation {
  id               String    @id @default(cuid())
  courseId         String
  relevanceScore   Float
  reason           String
  matchedInterests String[]
  matchedSkills    String[]
  dismissedAt      DateTime?
  userId           String
  user             User      @relation(fields: [userId], references: [id])

  @@unique([userId, courseId])
  @@index([userId, dismissedAt])
}
```

### DashboardPreferences

Stores user dashboard customization preferences.

```prisma
model DashboardPreferences {
  id              String   @id @default(cuid())
  widgetOrder     String[]
  visibleSections Json     @default("{}")
  customSettings  Json     @default("{}")
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
}
```

### LearningProfile Extensions

Added weekly goal tracking fields to the existing LearningProfile model:

- `weeklyGoalTarget: Int`
- `weeklyGoalCurrent: Int`
- `weeklyGoalUnit: String`
- `weeklyGoalStartDate: DateTime?`
- `weeklyGoalEndDate: DateTime?`

## Usage Examples

### Importing Types

```typescript
import type {
  User,
  Enrollment,
  Deadline,
  Achievement,
  LearningStreak,
  DashboardStats,
  PersonalizedOverviewProps,
  CourseProgressVisualizationProps,
} from "@/types";
```

### Using Component Props

```typescript
const PersonalizedOverview: React.FC<PersonalizedOverviewProps> = ({
  user,
  enrollments,
  upcomingDeadlines,
  recentActivity,
  achievements,
  onContinueCourse,
  onViewDeadlines,
  onViewAchievements,
}) => {
  // Component implementation
};
```

### Type-Safe API Responses

```typescript
async function fetchDashboardData(): Promise<
  ApiResponse<DashboardDataResponse>
> {
  const response = await fetch("/api/dashboard/data");
  return response.json();
}
```

## Best Practices

1. **Always use TypeScript strict mode** - All types are designed for strict type checking
2. **Import from the central index** - Use `@/types` instead of individual files
3. **Use type inference** - Let TypeScript infer types when possible
4. **Avoid `any`** - Use `unknown` or proper types instead
5. **Document complex types** - Add JSDoc comments for complex interfaces
6. **Keep types DRY** - Reuse base types and extend them when needed

## Related Documentation

- [Design Document](../../../.kiro/specs/student-dashboard-enhancements/design.md)
- [Requirements Document](../../../.kiro/specs/student-dashboard-enhancements/requirements.md)
- [Implementation Tasks](../../../.kiro/specs/student-dashboard-enhancements/tasks.md)
