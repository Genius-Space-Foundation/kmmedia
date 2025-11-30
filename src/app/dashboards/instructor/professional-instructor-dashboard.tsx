"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  Award,
  Target,
  Activity,
  Calendar,
  CheckCircle,
  TrendingUp,
  Zap,
  Link2,
  UserCog,
} from "lucide-react";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";
import { ModernSidebar } from "@/components/dashboard/modern-sidebar";
import { ModernHeader } from "@/components/dashboard/modern-header";
import { StatCard } from "@/components/ui/stat-card";

// Import modular components
import OverviewWidget from "@/components/instructor/dashboard/OverviewWidget";
import CourseManagement from "@/components/instructor/dashboard/CourseManagement";
import StudentAnalytics from "@/components/instructor/dashboard/StudentAnalytics";
import AssessmentCenter from "@/components/instructor/dashboard/AssessmentCenter";
import CommunicationHub from "@/components/instructor/dashboard/CommunicationHub";
import AIContentAssistant from "@/components/instructor/dashboard/AIContentAssistant";
import PredictiveAnalytics from "@/components/instructor/dashboard/PredictiveAnalytics";
import CollaborationHub from "@/components/instructor/dashboard/CollaborationHub";
import IntegrationHub from "@/components/instructor/dashboard/IntegrationHub";
import AdvancedReporting from "@/components/instructor/dashboard/AdvancedReporting";

// Import enhanced components
import TaskPrioritizationSystem from "@/components/instructor/dashboard/TaskPrioritizationSystem";
import EnhancedStudentActivityMonitoring from "@/components/instructor/dashboard/EnhancedStudentActivityMonitoring";
import CourseAnalyticsInsights from "@/components/instructor/dashboard/CourseAnalyticsInsights";
import IntegratedMessagingCenter from "@/components/instructor/dashboard/IntegratedMessagingCenter";
import InstructorProfileEditor from "@/components/instructor/profile/InstructorProfileEditor";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalCourses: number;
  activeStudents: number;
  pendingAssessments: number;
  unreadMessages: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function ProfessionalInstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUserProfile();
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (typeof window === "undefined") {
        return;
      }

      const response = await makeAuthenticatedRequest("/api/user/profile");
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      } else {
        console.error("Failed to fetch user profile:", result.message);
        if (result.message === "Invalid token") {
          clearAuthTokens();
          router.push("/auth/login");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (
        error instanceof Error &&
        error.message.includes("No valid authentication token")
      ) {
        clearAuthTokens();
        router.push("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (typeof window === "undefined") {
        return;
      }
      const response = await makeAuthenticatedRequest("/api/notifications");
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchStats = async () => {
    try {
      if (typeof window === "undefined") {
        return;
      }
      const response = await makeAuthenticatedRequest("/api/instructor/stats");
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/auth/login");
  };

  // Enhanced Dashboard Handlers
  const handleTaskClick = (taskId: string) => {
    console.log("View task:", taskId);
    // Navigate to task details or open modal
  };

  const handleMarkTaskComplete = (taskId: string) => {
    console.log("Mark task complete:", taskId);
    // Update task status
  };

  const handleUpdateTaskPriority = (taskId: string, priority: string) => {
    console.log("Update task priority:", taskId, priority);
    // Update task priority
  };

  const handleViewStudent = (studentId: string) => {
    console.log("View student:", studentId);
    // Navigate to student profile or open modal
  };

  const handleSendMessage = (studentId: string) => {
    console.log("Send message to student:", studentId);
    // Open messaging interface
    setActiveTab("communication");
  };

  const handleCreateIntervention = (studentId: string) => {
    console.log("Create intervention for student:", studentId);
    // Open intervention creation modal
  };

  const handleViewCourse = (courseId: string) => {
    console.log("View course:", courseId);
    // Navigate to course details
    setActiveTab("courses");
  };

  const handleImplementRecommendation = (recommendationId: string) => {
    console.log("Implement recommendation:", recommendationId);
    // Implement AI recommendation
  };

  const handleExportReport = (courseId: string) => {
    console.log("Export report for course:", courseId);
    // Export course analytics report
  };

  const handleMarkAsRead = (messageId: string) => {
    console.log("Mark message as read:", messageId);
    // Update message read status
  };

  const handleArchiveMessage = (messageId: string) => {
    console.log("Archive message:", messageId);
    // Archive message
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log("Delete message:", messageId);
    // Delete message
  };

  const handleStartVideoCall = (participantId: string) => {
    console.log("Start video call with:", participantId);
    // Start video call
  };

  const handleSendMessageFromCenter = (message: any) => {
    console.log("Send message:", message);
    // Send message through messaging center
  };

  const sidebarItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard overview and quick stats",
    },
    {
      id: "tasks",
      label: "Task Prioritization",
      icon: Target,
      description: "Prioritized task management system",
    },
    {
      id: "courses",
      label: "Course Management",
      icon: BookOpen,
      description: "Manage your courses and content",
    },
    {
      id: "students",
      label: "Student Monitoring",
      icon: Users,
      description: "Enhanced student activity tracking",
    },
    {
      id: "analytics",
      label: "Analytics & Reports",
      icon: BarChart3,
      description: "Course insights, analytics and reports",
    },
    {
      id: "communication",
      label: "Messaging Center",
      icon: MessageSquare,
      description: "Integrated messaging and communication",
    },
    {
      id: "assessments",
      label: "Assessment Center",
      icon: FileText,
      description: "Create and manage assessments",
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: Zap,
      description: "AI-powered content creation",
    },
    {
      id: "predictive",
      label: "Predictive Analytics",
      icon: TrendingUp,
      description: "Advanced predictive insights",
    },
    {
      id: "collaboration",
      label: "Collaboration Hub",
      icon: UserCog,
      description: "Team collaboration and reviews",
    },
    {
      id: "integrations",
      label: "Integration Hub",
      icon: Link2,
      description: "Third-party integrations",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      description: "Manage your profile and settings",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewWidget />;
      case "tasks":
        return (
          <TaskPrioritizationSystem
            onTaskClick={handleTaskClick}
            onMarkComplete={handleMarkTaskComplete}
            onUpdatePriority={handleUpdateTaskPriority}
          />
        );
      case "courses":
        return <CourseManagement />;
      case "students":
        return (
          <EnhancedStudentActivityMonitoring
            onViewStudent={handleViewStudent}
            onSendMessage={handleSendMessage}
            onCreateIntervention={handleCreateIntervention}
          />
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <CourseAnalyticsInsights
              onViewCourse={handleViewCourse}
              onImplementRecommendation={handleImplementRecommendation}
              onExportReport={handleExportReport}
            />
            <AdvancedReporting />
          </div>
        );
      case "communication":
        return (
          <IntegratedMessagingCenter
            onSendMessage={handleSendMessageFromCenter}
            onMarkAsRead={handleMarkAsRead}
            onArchiveMessage={handleArchiveMessage}
            onDeleteMessage={handleDeleteMessage}
            onStartVideoCall={handleStartVideoCall}
          />
        );
      case "assessments":
        return <AssessmentCenter />;
      case "ai-assistant":
        return <AIContentAssistant />;
      case "predictive":
        return <PredictiveAnalytics />;
      case "collaboration":
        return <CollaborationHub />;
      case "integrations":
        return <IntegrationHub />;
      case "profile":
        return <InstructorProfileEditor />;
      default:
        return <OverviewWidget />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-semibold">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  const navigationItems = sidebarItems.map(item => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    badge: null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex">
      {/* Modern Sidebar */}
      <ModernSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navigationItems={navigationItems}
        brandName="KM Media"
        brandSubtitle="Instructor Portal"
        brandInitials="KM"
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* Modern Header */}
        <ModernHeader
          title="Instructor Dashboard"
          subtitle="Manage your courses and students"
          currentUser={user}
          onProfileClick={() => setActiveTab("profile")}
          onSettingsClick={() => setActiveTab("profile")}
          onLogout={handleLogout}
          notificationCount={notifications?.filter((n: Notification) => !n.read).length || 0}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Grid for Overview Tab */}
          {activeTab === "overview" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Courses"
                value={stats.totalCourses || 0}
                change="+5.2%"
                trend="up"
                icon={BookOpen}
                iconColor="blue"
                subtitle="Active courses"
              />
              <StatCard
                title="Active Students"
                value={stats.activeStudents || 0}
                change="+12.3%"
                trend="up"
                icon={Users}
                iconColor="green"
                subtitle="Enrolled students"
              />
              <StatCard
                title="Pending Assessments"
                value={stats.pendingAssessments || 0}
                change="-3.1%"
                trend="down"
                icon={FileText}
                iconColor="orange"
                subtitle="Requires grading"
              />
              <StatCard
                title="Average Rating"
                value={stats.averageRating?.toFixed(1) || "0.0"}
                change="+0.3"
                trend="up"
                icon={Award}
                iconColor="purple"
                subtitle="Course ratings"
              />
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">
            {activeTab !== "overview" && (
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  {sidebarItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600 mt-2">
                  {sidebarItems.find((item) => item.id === activeTab)?.description}
                </p>
              </div>
            )}
            
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
