"use client";

import { useState, useEffect } from "react";
import MobileDashboardLayout from "./MobileDashboardLayout";
import MobileStudentDashboard from "./MobileStudentDashboard";
import MobileInstructorDashboard from "./MobileInstructorDashboard";
import MobileAdminDashboard from "./MobileAdminDashboard";
import MobileNotificationCenter from "./MobileNotificationCenter";
import { optimizeForMobile, handleMobileKeyboard } from "@/lib/mobile-utils";

interface MobileDashboardIntegrationProps {
  user: any;
  userRole: "student" | "instructor" | "admin";
  initialTab?: string;
}

export default function MobileDashboardIntegration({
  user,
  userRole,
  initialTab = "overview",
}: MobileDashboardIntegrationProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize mobile optimizations
    const cleanupMobileOptimizations = optimizeForMobile();
    const cleanupKeyboardHandler = handleMobileKeyboard();

    // Fetch dashboard data
    fetchDashboardData();

    return () => {
      cleanupMobileOptimizations();
      cleanupKeyboardHandler();
    };
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Mock data - in real implementation, this would be API calls
      const mockData = {
        student: {
          enrollments: [
            {
              id: "1",
              course: { id: "1", title: "Digital Photography" },
              status: "ACTIVE",
              progress: 75,
            },
            {
              id: "2",
              course: { id: "2", title: "Video Production" },
              status: "ACTIVE",
              progress: 45,
            },
          ],
          applications: [
            {
              id: "1",
              course: { id: "3", title: "Advanced Editing" },
              status: "PENDING",
            },
          ],
          courses: [
            {
              id: "3",
              title: "Advanced Editing",
              description: "Master advanced editing techniques",
              duration: 8,
              price: 500,
              rating: 4.8,
            },
          ],
          upcomingDeadlines: [
            {
              id: "1",
              title: "Photography Assignment",
              course: { title: "Digital Photography" },
              dueDate: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              priority: "high",
              type: "assignment",
            },
          ],
          achievements: [
            {
              id: "1",
              title: "First Course Completed",
              description: "Completed your first course",
              earnedDate: new Date().toISOString(),
            },
          ],
          learningStreak: {
            current: 5,
            longest: 12,
            lastActivity: "Today",
          },
          learningStats: {
            totalHours: 24,
            coursesCompleted: 1,
            averageScore: 87,
            weeklyGoal: { target: 10, current: 6, unit: "hours" },
          },
        },
        instructor: {
          courses: [
            {
              id: "1",
              title: "Digital Photography Basics",
              status: "ACTIVE",
              enrolledCount: 25,
              rating: 4.7,
            },
          ],
          students: Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: `Student ${i + 1}`,
            status: "ACTIVE",
          })),
          assignments: [
            {
              id: "1",
              title: "Portfolio Project",
              status: "SUBMITTED",
              submissions: 15,
            },
          ],
          analytics: {
            averageCompletionRate: 78,
            totalStudents: 25,
            totalCourses: 3,
          },
          pendingTasks: [
            { id: "1", title: "Grade assignments", priority: "high" },
          ],
        },
        admin: {
          systemStats: {
            uptime: "99.9%",
            responseTime: "120ms",
            serverLoad: 45,
          },
          users: Array.from({ length: 150 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            status: "ACTIVE",
          })),
          courses: Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            title: `Course ${i + 1}`,
            status: "ACTIVE",
          })),
          payments: [
            { id: "1", amount: 500, status: "PAID" },
            { id: "2", amount: 300, status: "PENDING" },
          ],
          alerts: [
            {
              id: "1",
              title: "High Server Load",
              description: "Server load is above 80%",
              priority: "high",
              createdAt: "2 hours ago",
            },
          ],
        },
      };

      setDashboardData(mockData[userRole] || {});
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "notifications") {
      setShowNotifications(true);
    } else {
      setShowNotifications(false);
    }
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-xl font-semibold text-gray-700">
              Loading Dashboard...
            </div>
          </div>
        </div>
      );
    }

    switch (userRole) {
      case "student":
        return (
          <MobileStudentDashboard
            user={user}
            enrollments={dashboardData.enrollments || []}
            applications={dashboardData.applications || []}
            courses={dashboardData.courses || []}
            upcomingDeadlines={dashboardData.upcomingDeadlines || []}
            achievements={dashboardData.achievements || []}
            learningStreak={dashboardData.learningStreak}
            learningStats={dashboardData.learningStats}
            onContinueCourse={(courseId) =>
              console.log("Continue course:", courseId)
            }
            onViewDeadlines={() => setActiveTab("deadlines")}
            onViewAchievements={() => setActiveTab("achievements")}
            onApplyForCourse={(courseId) =>
              console.log("Apply for course:", courseId)
            }
          />
        );

      case "instructor":
        return (
          <MobileInstructorDashboard
            user={user}
            courses={dashboardData.courses || []}
            students={dashboardData.students || []}
            assignments={dashboardData.assignments || []}
            analytics={dashboardData.analytics}
            pendingTasks={dashboardData.pendingTasks || []}
            onCreateCourse={() => console.log("Create course")}
            onViewCourse={(courseId) => console.log("View course:", courseId)}
            onGradeAssignment={(assignmentId) =>
              console.log("Grade assignment:", assignmentId)
            }
            onViewStudents={() => setActiveTab("students")}
            onViewAnalytics={() => setActiveTab("analytics")}
          />
        );

      case "admin":
        return (
          <MobileAdminDashboard
            user={user}
            systemStats={dashboardData.systemStats}
            users={dashboardData.users || []}
            courses={dashboardData.courses || []}
            payments={dashboardData.payments || []}
            alerts={dashboardData.alerts || []}
            onManageUsers={() => setActiveTab("users")}
            onManageCourses={() => setActiveTab("courses")}
            onViewReports={() => setActiveTab("reports")}
            onSystemSettings={() => setActiveTab("settings")}
            onViewAlert={(alertId) => console.log("View alert:", alertId)}
          />
        );

      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MobileDashboardLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole={userRole}
        user={user}
        notifications={[]} // This would come from API
      >
        {renderDashboardContent()}
      </MobileDashboardLayout>

      {/* Mobile Notification Center */}
      <MobileNotificationCenter
        userId={user?.id || ""}
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          setActiveTab("overview");
        }}
      />
    </div>
  );
}
