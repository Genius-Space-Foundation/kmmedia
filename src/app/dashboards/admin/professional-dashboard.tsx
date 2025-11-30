"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  User,
  BookOpen,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  BarChart3,
} from "lucide-react";
import { ModernSidebar } from "@/components/dashboard/modern-sidebar";
import { ModernHeader } from "@/components/dashboard/modern-header";
import { StatCard } from "@/components/ui/stat-card";
import ApplicationManagement from "@/components/admin/applications/ApplicationManagement";
import UserManagement from "@/components/admin/users/UserManagement";
import CourseManagement from "@/components/admin/courses/CourseManagement";
import SystemSettings from "@/components/admin/settings/SystemSettings";
import ReportsAnalytics from "@/components/admin/reports/ReportsAnalytics";
import ActivityLogs from "@/components/admin/logs/ActivityLogs";
import FinancialManagement from "@/components/admin/payments/FinancialManagement";
import DashboardOverview from "@/components/admin/dashboard/DashboardOverview";
import AdminProfile from "@/components/admin/profile/AdminProfile";

interface DashboardStats {
  totalUsers: number;
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  pendingApplications: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchStats();
    fetchUsers();
    fetchCourses();
    fetchApplications();
  }, []);

  const handleLogout = () => {
    // Clear all tokens
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Redirect to login
    router.push("/auth/login");
  };

  const fetchCurrentUser = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data?.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      if (data.success) {
        setCourses(data.data?.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      const data = await response.json();
      if (data.success) {
        setApplications(data.data?.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
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
          <p className="mt-4 text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      iconColor: "blue",
      subtitle: `${stats?.totalInstructors || 0} instructors, ${
        stats?.totalStudents || 0
      } students`,
    },
    {
      title: "Active Courses",
      value: stats?.totalCourses || 0,
      change: "+8.2%",
      trend: "up" as const,
      icon: BookOpen,
      iconColor: "purple",
      subtitle: "Across all categories",
    },
    {
      title: "Total Revenue",
      value: `GH₵${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+23.1%",
      trend: "up" as const,
      icon: DollarSign,
      iconColor: "green",
      subtitle: `GH₵${(
        stats?.monthlyRevenue || 0
      ).toLocaleString()} this month`,
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      change: "-5.3%",
      trend: "down" as const,
      icon: FileText,
      iconColor: "orange",
      subtitle: "Requires review",
    },
  ];

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      badge: null,
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      badge: null,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      badge: stats?.pendingApplications || 0,
    },
    {
      id: "payments",
      label: "Payments",
      icon: DollarSign,
      badge: null,
    },
    {
      id: "analytics",
      label: "Reports & Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "logs",
      label: "Activity Logs",
      icon: Activity,
      badge: null,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      badge: null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

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
        brandSubtitle="Admin Portal"
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
          title="Admin Dashboard"
          subtitle="Welcome back! Here's what's happening today."
          currentUser={currentUser}
          onProfileClick={() => setActiveTab("profile")}
          onSettingsClick={() => setActiveTab("settings")}
          onLogout={handleLogout}
          notificationCount={3}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-8 py-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                  <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    trend={stat.trend}
                    icon={stat.icon}
                    iconColor={stat.iconColor}
                    subtitle={stat.subtitle}
                  />
                ))}
              </div>

              {/* Dashboard Overview Component */}
              <DashboardOverview
                stats={stats}
                loading={loading}
                users={users}
                courses={courses}
                applications={applications}
              />
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-2">Manage all users, instructors, and students</p>
              </div>
              <UserManagement
                onRefresh={() => {
                  fetchStats();
                  fetchUsers();
                }}
              />
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Applications</h2>
                <p className="text-gray-600 mt-2">Review and manage course applications</p>
              </div>
              <ApplicationManagement
                onRefresh={() => {
                  fetchStats();
                  fetchApplications();
                }}
              />
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Course Management</h2>
                <p className="text-gray-600 mt-2">Manage all courses and curriculum</p>
              </div>
              <CourseManagement
                onRefresh={() => {
                  fetchStats();
                  fetchCourses();
                }}
              />
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Financial Management</h2>
                <p className="text-gray-600 mt-2">Track payments, revenue, and transactions</p>
              </div>
              <FinancialManagement />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Reports & Analytics</h2>
                <p className="text-gray-600 mt-2">View detailed reports and insights</p>
              </div>
              <ReportsAnalytics />
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Activity Logs</h2>
                <p className="text-gray-600 mt-2">Monitor system activities and changes</p>
              </div>
              <ActivityLogs />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">My Profile</h2>
                <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
              </div>
              <AdminProfile />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">System Settings</h2>
                <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
              </div>
              <SystemSettings />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}