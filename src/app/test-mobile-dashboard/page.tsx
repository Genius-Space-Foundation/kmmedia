"use client";

import { useState } from "react";
import MobilePersonalizedOverview from "@/components/student/dashboard/MobilePersonalizedOverview";
import MobileDashboardLayout from "@/components/mobile/MobileDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Test page for mobile-responsive dashboard implementation
 * This page demonstrates all the mobile features implemented in Task 36
 */
export default function TestMobileDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for testing
  const mockUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "STUDENT",
  };

  const mockEnrollments = [
    {
      id: "1",
      status: "ACTIVE",
      progress: 65,
      currentLesson: "Introduction to Video Editing",
      course: {
        id: "course-1",
        title: "Advanced Video Editing",
      },
    },
    {
      id: "2",
      status: "ACTIVE",
      progress: 30,
      currentLesson: "Color Theory Basics",
      course: {
        id: "course-2",
        title: "Photography Fundamentals",
      },
    },
    {
      id: "3",
      status: "COMPLETED",
      progress: 100,
      course: {
        id: "course-3",
        title: "Social Media Marketing",
      },
    },
  ];

  const mockDeadlines = [
    {
      id: "1",
      title: "Video Project Submission",
      daysLeft: 2,
      date: "2024-01-15",
      course: {
        title: "Advanced Video Editing",
      },
      priority: "high",
      type: "assignment",
      estimatedTime: 120,
    },
    {
      id: "2",
      title: "Photography Portfolio",
      daysLeft: 5,
      date: "2024-01-18",
      course: {
        title: "Photography Fundamentals",
      },
      priority: "medium",
      type: "project",
      estimatedTime: 180,
    },
    {
      id: "3",
      title: "Marketing Quiz",
      daysLeft: 7,
      date: "2024-01-20",
      course: {
        title: "Social Media Marketing",
      },
      priority: "low",
      type: "quiz",
      estimatedTime: 30,
    },
  ];

  const mockAchievements = [
    {
      id: "1",
      title: "First Course Completed",
      description: "Completed your first course",
      earnedDate: "2024-01-10",
      icon: "🎓",
    },
    {
      id: "2",
      title: "5-Day Streak",
      description: "Learned for 5 consecutive days",
      earnedDate: "2024-01-12",
      icon: "🔥",
    },
    {
      id: "3",
      title: "Perfect Score",
      description: "Scored 100% on an assessment",
      earnedDate: "2024-01-13",
      icon: "⭐",
    },
  ];

  const mockActivity = [
    {
      id: "1",
      type: "course",
      title: "Completed Lesson",
      description: "Introduction to Video Editing",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "assignment",
      title: "Submitted Assignment",
      description: "Photography Portfolio Draft",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ];

  const handleContinueCourse = (courseId: string) => {
    console.log("Continue course:", courseId);
    alert(`Continuing course: ${courseId}`);
  };

  const handleViewDeadlines = () => {
    console.log("View deadlines");
    alert("Viewing all deadlines");
  };

  const handleViewAchievements = () => {
    console.log("View achievements");
    alert("Viewing all achievements");
  };

  return (
    <MobileDashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userRole="student"
      user={mockUser}
      notifications={[
        { id: "1", read: false, title: "New assignment posted" },
        { id: "2", read: false, title: "Grade available" },
      ]}
    >
      <div className="space-y-6">
        {/* Test Information Card */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📱</span>
              <span>Mobile Dashboard Test Page</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700">
              This page demonstrates all mobile-responsive features implemented
              in Task 36:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>✅ Mobile-optimized PersonalizedOverview</li>
              <li>✅ Swipeable stats widgets</li>
              <li>✅ Collapsible navigation menu</li>
              <li>✅ Touch-friendly button sizes (min 44x44px)</li>
              <li>✅ Mobile-specific shortcuts grid</li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-green-100 text-green-800">
                Requirements 7.1 ✓
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Requirements 7.2 ✓
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Feature Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">1. Swipeable Stats</h3>
              <p className="text-sm text-gray-600">
                Swipe left/right on the stats widgets below to navigate between
                pages. Notice the page indicators and haptic feedback (on
                supported devices).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">2. Collapsible Menu</h3>
              <p className="text-sm text-gray-600">
                Tap the menu icon in the welcome card to expand/collapse the
                quick navigation menu.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">3. Touch Targets</h3>
              <p className="text-sm text-gray-600">
                All buttons and interactive elements are at least 44x44px for
                easy tapping.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">4. Shortcuts Grid</h3>
              <p className="text-sm text-gray-600">
                The shortcuts grid adapts from 2 to 4 columns based on screen
                size and orientation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Personalized Overview Component */}
        <MobilePersonalizedOverview
          user={mockUser}
          enrollments={mockEnrollments}
          upcomingDeadlines={mockDeadlines}
          recentActivity={mockActivity}
          achievements={mockAchievements}
          onContinueCourse={handleContinueCourse}
          onViewDeadlines={handleViewDeadlines}
          onViewAchievements={handleViewAchievements}
        />

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Screen Width:</span>
                <span className="ml-2" id="screen-width">
                  {typeof window !== "undefined" ? window.innerWidth : "N/A"}px
                </span>
              </div>
              <div>
                <span className="font-semibold">Screen Height:</span>
                <span className="ml-2" id="screen-height">
                  {typeof window !== "undefined" ? window.innerHeight : "N/A"}
                  px
                </span>
              </div>
              <div>
                <span className="font-semibold">User Agent:</span>
                <span className="ml-2 text-xs truncate block">
                  {typeof window !== "undefined"
                    ? navigator.userAgent.substring(0, 30) + "..."
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Touch Support:</span>
                <span className="ml-2">
                  {typeof window !== "undefined" &&
                  ("ontouchstart" in window || navigator.maxTouchPoints > 0)
                    ? "Yes ✓"
                    : "No ✗"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm">Mobile-optimized Overview</span>
                <Badge className="bg-green-500 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm">Swipeable Stats Widgets</span>
                <Badge className="bg-green-500 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm">Collapsible Navigation</span>
                <Badge className="bg-green-500 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm">Touch-Friendly Buttons</span>
                <Badge className="bg-green-500 text-white">Complete</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm">Shortcuts Grid</span>
                <Badge className="bg-green-500 text-white">Complete</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileDashboardLayout>
  );
}
