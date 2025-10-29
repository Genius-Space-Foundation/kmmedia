"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  User,
  BookOpen,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Bell,
  Settings,
  Search,
  Filter,
  Download,
  ChevronRight,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Eye,
  Edit,
  Trash2,
  LogOut,
  ChevronDown,
} from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
      subtitle: `${stats?.totalInstructors || 0} instructors, ${
        stats?.totalStudents || 0
      } students`,
    },
    {
      title: "Active Courses",
      value: stats?.totalCourses || 0,
      change: "+8.2%",
      trend: "up",
      icon: BookOpen,
      color: "purple",
      subtitle: "Across all categories",
    },
    {
      title: "Total Revenue",
      value: `GH₵${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
      color: "green",
      subtitle: `GH₵${(
        stats?.monthlyRevenue || 0
      ).toLocaleString()} this month`,
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      change: "-5.3%",
      trend: "down",
      icon: FileText,
      color: "orange",
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
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
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
      id: "reports",
      label: "Reports",
      icon: TrendingUp,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200/50">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">KM</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">KM Media</h2>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <ChevronRight className="h-5 w-5 transform rotate-180" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {item.label}
                    </span>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge
                        className={`${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Need Help?
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Check our documentation
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
                  >
                    Get Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-sm text-gray-500">
                      Welcome back! Here&apos;s what&apos;s happening today.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Notifications */}
                <Button
                  variant="outline"
                  size="icon"
                  className="relative rounded-xl"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Profile Dropdown */}
                <div className="pl-4 border-l border-gray-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-3 hover:bg-gray-50"
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-blue-500 ring-offset-2">
                          {currentUser?.avatar && (
                            <AvatarImage
                              src={currentUser.avatar}
                              alt={currentUser.name}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {currentUser?.name
                              ? currentUser.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-semibold text-gray-900">
                            {currentUser?.name || "Admin User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUser?.email || "admin@kmmedia.com"}
                          </p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500 hidden lg:block" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setActiveTab("settings")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>System Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <DashboardOverview
              stats={stats}
              loading={loading}
              users={users}
              courses={courses}
              applications={applications}
            />
          )}

          {/* Legacy Overview Content - Removed and replaced with DashboardOverview component */}
          {false && activeTab === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  const isPositive = stat.trend === "up";
                  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

                  return (
                    <Card
                      key={stat.title}
                      className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-xl"
                    >
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500`}
                      ></div>

                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium text-gray-600">
                              {stat.title}
                            </CardTitle>
                          </div>
                          <div
                            className={`flex items-center space-x-1 text-sm font-semibold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            <TrendIcon className="h-4 w-4" />
                            <span>{stat.change}</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </div>
                        <p className="text-sm text-gray-500">{stat.subtitle}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Charts and Tables Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold">
                        Revenue Overview
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Last 30 days
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Revenue chart will be displayed here
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Integrate with Chart.js or Recharts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          icon: Users,
                          color: "blue",
                          title: "New User Registered",
                          subtitle: "John Doe joined as student",
                          time: "2 min ago",
                        },
                        {
                          icon: BookOpen,
                          color: "purple",
                          title: "Course Published",
                          subtitle: "Advanced Film Production",
                          time: "15 min ago",
                        },
                        {
                          icon: DollarSign,
                          color: "green",
                          title: "Payment Received",
                          subtitle: "GH₵50,000 from Alice Johnson",
                          time: "1 hour ago",
                        },
                        {
                          icon: FileText,
                          color: "orange",
                          title: "Application Submitted",
                          subtitle: "Bob Wilson applied for course",
                          time: "2 hours ago",
                        },
                      ].map((activity, index) => {
                        const ActivityIcon = activity.icon;
                        return (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                          >
                            <div
                              className={`w-10 h-10 bg-${activity.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              <ActivityIcon
                                className={`h-5 w-5 text-${activity.color}-600`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {activity.subtitle}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.time}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Tables Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Courses */}
                <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold">
                        Top Performing Courses
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="rounded-xl">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Film Production Masterclass",
                          students: 145,
                          revenue: "GH₵725,000",
                          rating: 4.8,
                        },
                        {
                          title: "Video Editing for Beginners",
                          students: 128,
                          revenue: "GH₵640,000",
                          rating: 4.7,
                        },
                        {
                          title: "Advanced Cinematography",
                          students: 96,
                          revenue: "GH₵576,000",
                          rating: 4.9,
                        },
                        {
                          title: "Sound Design Fundamentals",
                          students: 84,
                          revenue: "GH₵420,000",
                          rating: 4.6,
                        },
                      ].map((course, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {course.title}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  {course.students} students
                                </span>
                                <span className="text-xs font-semibold text-green-600">
                                  {course.revenue}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-sm font-bold text-yellow-600">
                                ⭐ {course.rating}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Users */}
                <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold">
                        Recent Users
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="rounded-xl">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "John Doe",
                          email: "john@example.com",
                          role: "Student",
                          status: "active",
                          joined: "2 days ago",
                        },
                        {
                          name: "Jane Smith",
                          email: "jane@example.com",
                          role: "Instructor",
                          status: "active",
                          joined: "3 days ago",
                        },
                        {
                          name: "Bob Wilson",
                          email: "bob@example.com",
                          role: "Student",
                          status: "pending",
                          joined: "5 days ago",
                        },
                        {
                          name: "Alice Johnson",
                          email: "alice@example.com",
                          role: "Student",
                          status: "active",
                          joined: "1 week ago",
                        },
                      ].map((user, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50/50 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                                >
                                  {user.role}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  • {user.joined}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                user.status === "active"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }
                            >
                              {user.status}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { icon: Users, label: "Manage Users", count: "1,250+" },
                      { icon: BookOpen, label: "Manage Courses", count: "78" },
                      {
                        icon: FileText,
                        label: "Applications",
                        count: "12 pending",
                      },
                      { icon: Settings, label: "Settings", count: "Configure" },
                    ].map((action, index) => {
                      const ActionIcon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="h-auto p-6 flex flex-col items-center space-y-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/20 transition-all group"
                        >
                          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ActionIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-white">
                              {action.label}
                            </p>
                            <p className="text-sm text-white/80 mt-1">
                              {action.count}
                            </p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard
                </h2>
                <p className="text-gray-600">Detailed insights and metrics</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                        <p className="text-gray-500">User analytics chart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-green-400 mx-auto mb-2" />
                        <p className="text-gray-500">
                          Course performance chart
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <UserManagement
              onRefresh={() => {
                fetchStats();
                fetchUsers();
              }}
            />
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <ApplicationManagement
              onRefresh={() => {
                fetchStats();
                fetchApplications();
              }}
            />
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <CourseManagement
              onRefresh={() => {
                fetchStats();
                fetchCourses();
              }}
            />
          )}

          {/* Legacy Users Tab - Keeping for reference */}
          {false && activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    User Management
                  </h2>
                  <p className="text-gray-600">
                    Manage all users in the system
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
              <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button variant="outline" className="rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              User
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Role
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Joined
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 10).map((user, index) => (
                            <tr
                              key={user.id || index}
                              className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10 ring-2 ring-white shadow">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                                      {user.name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={
                                    user.status === "ACTIVE"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : user.status === "SUSPENDED"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                                  }
                                >
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>No users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Course Management
                  </h2>
                  <p className="text-gray-600">
                    Manage all courses and content
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
              <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button variant="outline" className="rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.slice(0, 9).map((course, index) => (
                        <Card
                          key={course.id || index}
                          className="border border-gray-200 hover:shadow-xl transition-all group"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                              <Badge
                                className={
                                  course.status === "PUBLISHED"
                                    ? "bg-green-100 text-green-700"
                                    : course.status === "DRAFT"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {course.status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {course._count?.enrollments || 0} students
                              </span>
                              <span className="font-semibold text-green-600">
                                GH₵{(course.price || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-lg"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-lg"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>No courses found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Applications
                  </h2>
                  <p className="text-gray-600">
                    Review and manage course applications
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 px-4 py-2 text-base">
                  {stats?.pendingApplications || 0} Pending
                </Badge>
              </div>
              <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search applications..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button variant="outline" className="rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.slice(0, 10).map((app, index) => (
                        <div
                          key={app.id || index}
                          className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 hover:shadow-md transition-all group border border-gray-100"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {app.user?.name || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {app.course?.title || "Unknown Course"}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge
                                  className={
                                    app.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : app.status === "APPROVED"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }
                                >
                                  {app.status}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    app.submittedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {app.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {app.status !== "PENDING" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>No applications found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && <FinancialManagement />}

          {/* Reports Tab */}
          {activeTab === "reports" && <ReportsAnalytics />}

          {/* Activity Logs Tab */}
          {activeTab === "logs" && <ActivityLogs />}

          {/* Profile Tab */}
          {activeTab === "profile" && <AdminProfile />}

          {/* Settings Tab */}
          {activeTab === "settings" && <SystemSettings />}
        </main>
      </div>
    </div>
  );
}
