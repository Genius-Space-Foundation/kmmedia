"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Award,
} from "lucide-react";
import { ModernSidebar } from "@/components/dashboard/modern-sidebar";
import { ModernHeader } from "@/components/dashboard/modern-header";
import { StatCard } from "@/components/ui/stat-card";

// Import modular components
import OverviewWidget from "@/components/instructor/dashboard/OverviewWidget";
import CourseManagement from "@/components/instructor/dashboard/CourseManagement";
import AssessmentCenter from "@/components/instructor/dashboard/AssessmentCenter";
import EnhancedStudentActivityMonitoring from "@/components/instructor/dashboard/EnhancedStudentActivityMonitoring";
import CommunicationHub from "@/components/instructor/dashboard/CommunicationHub";
import InstructorProfileEditor from "@/components/instructor/profile/InstructorProfileEditor";
import AIContentAssistant from "@/components/instructor/dashboard/AIContentAssistant";
import IntegrationHub from "@/components/instructor/dashboard/IntegrationHub";
import CourseAnalyticsInsights from "@/components/instructor/dashboard/CourseAnalyticsInsights";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
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
  averageRating: number;
}

export default function ProfessionalInstructorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Role-based access control
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "INSTRUCTOR") {
        console.warn("Non-instructor user accessing instructor dashboard");
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else if (session?.user?.role === "STUDENT") {
          router.push("/dashboards/student");
        } else {
          router.push("/auth/login");
        }
        return;
      }

      if (session.user) {
        setUser({
          id: session.user.id || "",
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role || "",
          profileImage: session.user.image || undefined,
        });
      }

      fetchNotifications();
      fetchStats();
    }
  }, [status, session, router]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
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
      const response = await fetch("/api/instructor/stats", {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  // Event handlers
  const handleViewStudent = (studentId: string) => {
    console.log("View student:", studentId);
  };

  const handleSendMessage = (studentId: string) => {
    console.log("Send message to student:", studentId);
    setActiveTab("communication");
  };

  const handleCreateIntervention = (studentId: string) => {
    console.log("Create intervention for student:", studentId);
  };

  const handleViewCourse = (courseId: string) => {
    console.log("View course:", courseId);
    setActiveTab("courses");
  };

  const handleImplementRecommendation = (recommendationId: string) => {
    console.log("Implement recommendation:", recommendationId);
  };

  const handleExportReport = (courseId: string) => {
    console.log("Export report for course:", courseId);
  };



  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview and quick actions",
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      description: "Manage courses and content",
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
      description: "Student monitoring and progress",
    },
    {
      id: "assessments",
      label: "Assessments & Grading",
      icon: FileText,
      description: "Manage assessments and grading",
    },
    {
      id: "communication",
      label: "Communication",
      icon: MessageSquare,
      description: "Messages and announcements",
    },
    {
      id: "settings",
      label: "Settings & Tools",
      icon: Settings,
      description: "Profile, AI tools, and integrations",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <OverviewWidget />;
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
      case "assessments":
        return <AssessmentCenter />;
      case "communication":
        return <CommunicationHub />;
      case "settings":
        // Settings tab has sub-tabs
        return renderSettingsContent();
      default:
        return <OverviewWidget />;
    }
  };

  const renderSettingsContent = () => {
    const settingsSubTabs = [
      { id: "profile", label: "Profile" },
      { id: "ai-tools", label: "AI Tools" },
      { id: "integrations", label: "Integrations" },
      { id: "analytics", label: "Advanced Analytics" },
    ];

    return (
      <div className="space-y-6">
        {/* Sub-tab navigation */}
        <div className="flex space-x-2 border-b border-neutral-200">
          {settingsSubTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeSubTab === tab.id
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-tab content */}
        <div>
          {activeSubTab === "profile" && <InstructorProfileEditor />}
          {activeSubTab === "ai-tools" && <AIContentAssistant />}
          {activeSubTab === "integrations" && <IntegrationHub />}
          {activeSubTab === "analytics" && (
            <CourseAnalyticsInsights
              onViewCourse={handleViewCourse}
              onImplementRecommendation={handleImplementRecommendation}
              onExportReport={handleExportReport}
            />
          )}
        </div>
      </div>
    );
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-neutral-600 font-semibold">
            Loading instructor dashboard...
          </p>
        </div>
      </div>
    );
  }

  const navigationItems = sidebarItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    badge: null,
  }));

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Modern Sidebar */}
      <ModernSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navigationItems={navigationItems}
        brandName="KM Media"
        brandSubtitle="Instructor Portal"
        brandLogo="/images/logo.jpeg"
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
          onProfileClick={() => {
            setActiveTab("settings");
            setActiveSubTab("profile");
          }}
          onSettingsClick={() => {
            setActiveTab("settings");
            setActiveSubTab("profile");
          }}
          onLogout={handleLogout}
          notificationCount={
            Array.isArray(notifications)
              ? notifications.filter((n: Notification) => !n.read).length
              : 0
          }
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Grid for Dashboard Tab */}
          {activeTab === "dashboard" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Courses"
                value={stats.totalCourses || 0}
                change="+5.2%"
                trend="up"
                icon={BookOpen}
                iconColor="brand-primary"
                subtitle="Active courses"
              />
              <StatCard
                title="Active Students"
                value={stats.activeStudents || 0}
                change="+12.3%"
                trend="up"
                icon={Users}
                iconColor="success"
                subtitle="Enrolled students"
              />
              <StatCard
                title="Pending Assessments"
                value={stats.pendingAssessments || 0}
                change="-3.1%"
                trend="down"
                icon={FileText}
                iconColor="warning"
                subtitle="Requires grading"
              />
              <StatCard
                title="Average Rating"
                value={stats.averageRating?.toFixed(1) || "0.0"}
                change="+0.3"
                trend="up"
                icon={Award}
                iconColor="info"
                subtitle="Course ratings"
              />
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">
            {activeTab !== "dashboard" && (
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">
                  {sidebarItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-neutral-600 mt-2">
                  {
                    sidebarItems.find((item) => item.id === activeTab)
                      ?.description
                  }
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
