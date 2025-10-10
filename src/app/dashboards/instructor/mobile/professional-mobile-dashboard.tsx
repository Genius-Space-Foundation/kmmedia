"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Brain,
  Users2,
  Link as LinkIcon,
  BarChart,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";

// Import mobile components
import MobileStudentAnalytics from "@/components/instructor/dashboard/MobileStudentAnalytics";
import MobileCourseManagement from "@/components/instructor/dashboard/MobileCourseManagement";
import MobileInstructorDashboard from "@/components/instructor/dashboard/MobileInstructorDashboard";
import InstructorAvatar from "@/components/instructor/profile/InstructorAvatar";

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
}

export default function ProfessionalMobileInstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const sidebarItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard overview and quick stats",
    },
    {
      id: "courses",
      label: "Course Management",
      icon: BookOpen,
      description: "Manage your courses and content",
    },
    {
      id: "students",
      label: "Student Analytics",
      icon: Users,
      description: "Track student progress and performance",
    },
    {
      id: "assessments",
      label: "Assessment Center",
      icon: FileText,
      description: "Create and manage assessments",
    },
    {
      id: "communication",
      label: "Communication Hub",
      icon: MessageSquare,
      description: "Announcements and messaging",
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: Brain,
      description: "AI-powered content creation",
    },
    {
      id: "analytics",
      label: "Predictive Analytics",
      icon: BarChart3,
      description: "Advanced analytics and insights",
    },
    {
      id: "collaboration",
      label: "Collaboration Hub",
      icon: Users2,
      description: "Team collaboration and reviews",
    },
    {
      id: "integrations",
      label: "Integration Hub",
      icon: LinkIcon,
      description: "Third-party integrations",
    },
    {
      id: "reports",
      label: "Advanced Reporting",
      icon: BarChart,
      description: "Custom reports and exports",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <MobileInstructorDashboard />;
      case "courses":
        return <MobileCourseManagement />;
      case "students":
        return <MobileStudentAnalytics />;
      case "assessments":
        return (
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Center</CardTitle>
                <CardDescription>
                  Create and manage assessments for your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Assessment management features coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "communication":
        return (
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication Hub</CardTitle>
                <CardDescription>
                  Announcements and messaging with students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Communication features coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <MobileInstructorDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Instructor Hub
              </h1>
              <p className="text-xs text-gray-600">Professional Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Mobile Quick Stats */}
        {stats && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {stats.totalCourses}
                </div>
                <div className="text-xs text-blue-600">Courses</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {stats.activeStudents}
                </div>
                <div className="text-xs text-green-600">Students</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {stats.pendingAssessments}
                </div>
                <div className="text-xs text-orange-600">Pending</div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Instructor Hub
                    </h1>
                    <p className="text-sm text-gray-600">
                      Professional Dashboard
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-gray-100/80 rounded-xl p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                        : "hover:bg-gray-100/80 hover:scale-105"
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-80">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200/50">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80">
                <InstructorAvatar
                  src={user?.profileImage || user?.profile?.avatar}
                  name={user?.name}
                  size="md"
                  showBorder
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {user?.name || "Instructor"}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {user?.email || "instructor@example.com"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
