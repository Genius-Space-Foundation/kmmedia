"use client";

import { useState } from "react";
import ResponsivePersonalizedOverview from "./ResponsivePersonalizedOverview";
import MobileDashboardLayout from "../layout/MobileDashboardLayout";

/**
 * Example component demonstrating mobile-responsive dashboard implementation
 *
 * This component shows how to use:
 * - ResponsivePersonalizedOverview: Automatically switches between desktop and mobile views
 * - MobileDashboardLayout: Provides mobile-optimized layout with collapsible navigation
 * - Touch-friendly interactions with proper sizing (min 44x44px)
 * - Swipeable stats widgets
 * - Mobile shortcuts grid
 *
 * Requirements validated:
 * - 7.1: Responsive layout optimized for screens below 768px
 * - 7.2: Collapsible navigation menu with touch-friendly targets
 */
export default function MobileDashboardExample() {
  // Mock data for demonstration
  const mockUser = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "STUDENT",
  };

  const mockEnrollments = [
    {
      id: "1",
      userId: "1",
      courseId: "course-1",
      course: {
        id: "course-1",
        title: "Introduction to Web Development",
        description: "Learn the basics of HTML, CSS, and JavaScript",
      },
      status: "ACTIVE",
      progress: 45,
      currentLesson: "Lesson 5: JavaScript Basics",
      timeSpent: 180, // minutes
      enrolledAt: new Date("2024-01-01"),
      lastAccessedAt: new Date(),
    },
    {
      id: "2",
      userId: "1",
      courseId: "course-2",
      course: {
        id: "course-2",
        title: "Advanced React Patterns",
        description: "Master advanced React concepts and patterns",
      },
      status: "ACTIVE",
      progress: 20,
      currentLesson: "Lesson 2: Custom Hooks",
      timeSpent: 90,
      enrolledAt: new Date("2024-02-01"),
      lastAccessedAt: new Date(),
    },
    {
      id: "3",
      userId: "1",
      courseId: "course-3",
      course: {
        id: "course-3",
        title: "UI/UX Design Fundamentals",
        description: "Learn the principles of great user interface design",
      },
      status: "COMPLETED",
      progress: 100,
      timeSpent: 300,
      enrolledAt: new Date("2023-12-01"),
      completedAt: new Date("2024-01-15"),
      lastAccessedAt: new Date("2024-01-15"),
    },
  ];

  const mockDeadlines = [
    {
      id: "1",
      title: "Final Project Submission",
      description: "Submit your completed web application",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      courseId: "course-1",
      course: {
        id: "course-1",
        title: "Introduction to Web Development",
        color: "#3B82F6",
      },
      type: "project" as const,
      priority: "high" as const,
      status: "pending" as const,
      estimatedTime: 120,
      reminderSet: false,
      daysLeft: 2,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
    {
      id: "2",
      title: "Quiz: React Hooks",
      description: "Complete the quiz on React Hooks",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      courseId: "course-2",
      course: {
        id: "course-2",
        title: "Advanced React Patterns",
        color: "#8B5CF6",
      },
      type: "quiz" as const,
      priority: "medium" as const,
      status: "pending" as const,
      estimatedTime: 30,
      reminderSet: true,
      daysLeft: 5,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
  ];

  const mockAchievements = [
    {
      id: "1",
      title: "First Course Completed",
      description: "Completed your first course",
      icon: "🎓",
      category: "milestone" as const,
      rarity: "common" as const,
      points: 100,
      earnedDate: "2 weeks ago",
    },
    {
      id: "2",
      title: "5-Day Streak",
      description: "Learned for 5 consecutive days",
      icon: "🔥",
      category: "engagement" as const,
      rarity: "rare" as const,
      points: 250,
      earnedDate: "1 week ago",
    },
    {
      id: "3",
      title: "Quick Learner",
      description: "Completed 10 lessons in one day",
      icon: "⚡",
      category: "learning" as const,
      rarity: "epic" as const,
      points: 500,
      earnedDate: "3 days ago",
    },
  ];

  const mockRecentActivity = [
    {
      id: "1",
      userId: "1",
      type: "lesson_completed" as const,
      title: "Completed Lesson 5",
      description: "JavaScript Basics",
      courseId: "course-1",
      courseName: "Introduction to Web Development",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2",
      userId: "1",
      type: "assignment_submitted" as const,
      title: "Submitted Assignment",
      description: "Build a Todo App",
      courseId: "course-1",
      courseName: "Introduction to Web Development",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  const [notificationCount] = useState(3);

  const handleContinueCourse = (courseId: string) => {
    console.log("Continue course:", courseId);
    // Navigate to course page
  };

  const handleViewDeadlines = () => {
    console.log("View all deadlines");
    // Navigate to deadlines page
  };

  const handleViewAchievements = () => {
    console.log("View all achievements");
    // Navigate to achievements page
  };

  const handleLogout = () => {
    console.log("Logout");
    // Perform logout
  };

  return (
    <MobileDashboardLayout
      user={mockUser}
      notificationCount={notificationCount}
      onLogout={handleLogout}
    >
      <ResponsivePersonalizedOverview
        user={mockUser}
        enrollments={mockEnrollments}
        upcomingDeadlines={mockDeadlines}
        recentActivity={mockRecentActivity}
        achievements={mockAchievements}
        onContinueCourse={handleContinueCourse}
        onViewDeadlines={handleViewDeadlines}
        onViewAchievements={handleViewAchievements}
      />
    </MobileDashboardLayout>
  );
}
