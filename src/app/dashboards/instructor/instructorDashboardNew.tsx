"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";

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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

export default function InstructorDashboardNew() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Set client flag and fetch data
    setIsClient(true);
    if (typeof window !== "undefined") {
      // Add a small delay to ensure we're fully on the client side
      const timer = setTimeout(() => {
        fetchUserProfile();
        fetchNotifications();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Check if we're on the client side
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
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const response = await makeAuthenticatedRequest("/api/notifications");

      // Check if response is JSON
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

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/auth/login");
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">KM</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Instructor Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your courses and students
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative bg-white/50 hover:bg-white/80 border-gray-200/50 shadow-sm px-4 py-2"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">🔔</span>
                    <span>Notifications</span>
                  </span>
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-lg">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-4 bg-white/50 rounded-xl px-6 py-3 shadow-sm border border-gray-200/50">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  <span className="text-sm font-medium">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-4 py-2"
                >
                  <span className="flex items-center space-x-2">
                    <span>🚪</span>
                    <span>Logout</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200/60">
            <TabsList className="flex w-full bg-gray-50/80 rounded-2xl p-2 gap-1 overflow-x-auto scrollbar-hide">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="assessments"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Assessments
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Communication
              </TabsTrigger>
              <TabsTrigger
                value="ai-assistant"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                AI Assistant
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="collaboration"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Collaboration
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Integrations
              </TabsTrigger>
              <TabsTrigger
                value="reporting"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 hover:bg-gray-100/80 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                Reporting
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Here&apos;s what&apos;s happening with your courses today.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    📊 Export Data
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                  >
                    ⚡ Quick Actions
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <OverviewWidget />
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <CourseManagement />
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <StudentAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <AssessmentCenter />
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <CommunicationHub />
            </div>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    🤖 AI Content Assistant
                  </h2>
                  <p className="text-purple-100 text-lg">
                    Get intelligent suggestions for course content and structure
                  </p>
                </div>
                <div className="text-6xl opacity-20">🧠</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <AIContentAssistant />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <PredictiveAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <CollaborationHub />
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <IntegrationHub />
            </div>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-8">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    📊 Advanced Reporting
                  </h2>
                  <p className="text-green-100 text-lg">
                    Comprehensive analytics and custom reporting
                  </p>
                </div>
                <div className="text-6xl opacity-20">📈</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <AdvancedReporting />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Actions Sidebar */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          <Button
            size="lg"
            className="rounded-full shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            onClick={() => setActiveTab("ai-assistant")}
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl">🤖</span>
              <span className="hidden sm:inline">AI Assistant</span>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full shadow-xl bg-white/80 hover:bg-white border-gray-200/50 backdrop-blur-sm"
            onClick={() => setActiveTab("courses")}
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl">📚</span>
              <span className="hidden sm:inline">Create Course</span>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full shadow-xl bg-white/80 hover:bg-white border-gray-200/50 backdrop-blur-sm"
            onClick={() => setActiveTab("analytics")}
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <span className="hidden sm:inline">Analytics</span>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full shadow-xl bg-white/80 hover:bg-white border-gray-200/50 backdrop-blur-sm"
            onClick={() => setActiveTab("collaboration")}
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl">👥</span>
              <span className="hidden sm:inline">Collaborate</span>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full shadow-xl bg-white/80 hover:bg-white border-gray-200/50 backdrop-blur-sm"
            onClick={() => setActiveTab("integrations")}
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl">🔌</span>
              <span className="hidden sm:inline">Integrate</span>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full shadow-xl bg-white/80 hover:bg-white border-gray-200/50 backdrop-blur-sm"
            onClick={() => setActiveTab("reporting")}
          >
            <span className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <span className="hidden sm:inline">Reports</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
