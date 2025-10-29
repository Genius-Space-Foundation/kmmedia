"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Award,
  Target,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Brain,
  Lightbulb,
  Users2,
  MessageCircle,
  Share2,
  Link as LinkIcon,
  Database,
  Cloud,
  Shield,
  Lock,
  Unlock,
  EyeOff,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Send,
  Upload,
  Download as DownloadIcon,
  Copy,
  Cut,
  Paste,
  Archive,
  Trash,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Home,
  GraduationCap,
  BookMarked,
  ClipboardList,
  BarChart,
  UserCheck,
  MessageSquareText,
  Video,
  Mic,
  Camera,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  Power,
  Zap as ZapIcon,
  Flame,
  Snowflake,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Timer,
  Stopwatch,
  Hourglass,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Navigation,
  Compass,
  Globe as GlobeIcon,
  World,
  Earth,
  Satellite,
  Rocket,
  Plane,
  Car,
  Bike,
  Bus,
  Train,
  Ship,
  Anchor,
  Flag,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Heart,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Hand,
  Point,
  Fingerprint,
  Key,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Shield as ShieldIcon,
  Check,
  X as XIcon,
  Plus as PlusIcon,
  Minus,
  Divide,
  Multiply,
  Equal,
  Infinity,
  Pi,
  Sigma,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Rho,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega,
} from "lucide-react";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";

// Import layout components
import InstructorSidebar from "@/components/instructor/layout/InstructorSidebar";
import InstructorHeader from "@/components/instructor/layout/InstructorHeader";

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
      label: "Course Analytics",
      icon: BarChart3,
      description: "Course insights and recommendations",
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
      icon: Brain,
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
          <CourseAnalyticsInsights
            onViewCourse={handleViewCourse}
            onImplementRecommendation={handleImplementRecommendation}
            onExportReport={handleExportReport}
          />
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
      case "reports":
        return <AdvancedReporting />;
      default:
        return <OverviewWidget />;
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <InstructorSidebar
          user={user}
          notifications={notifications}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <InstructorHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={notifications}
            stats={stats}
            onLogout={handleLogout}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            activeTab={activeTab}
            user={user}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {
                        sidebarItems.find((item) => item.id === activeTab)
                          ?.label
                      }
                    </h1>
                    <p className="text-gray-600 mt-2">
                      {
                        sidebarItems.find((item) => item.id === activeTab)
                          ?.description
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="rounded-xl">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      New
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
