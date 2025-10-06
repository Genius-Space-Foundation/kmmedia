"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import EnhancedDashboard from "@/components/admin/dashboard/EnhancedDashboard";
import MobileOptimizedTable from "@/components/admin/responsive/MobileOptimizedTable";
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";
import WorkflowManager from "@/components/admin/workflows/WorkflowManager";
import NotificationCenter from "@/components/admin/notifications/NotificationCenter";
import ExportManager from "@/components/admin/export/ExportManager";
import AIInsights from "@/components/admin/ai/AIInsights";
import SystemHealth from "@/components/admin/monitoring/SystemHealth";
import PerformanceMonitor from "@/components/admin/monitoring/PerformanceMonitor";
import UserBehaviorAnalytics from "@/components/admin/analytics/UserBehaviorAnalytics";
import AdvancedReporting from "@/components/admin/reporting/AdvancedReporting";
import ThirdPartyIntegrations from "@/components/admin/integrations/ThirdPartyIntegrations";
import AutomatedTesting from "@/components/admin/testing/AutomatedTesting";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  lastLogin?: string;
  profile: {
    phone?: string;
    bio?: string;
  };
  _count?: {
    courses?: number;
    applications?: number;
    enrollments?: number;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  approvalComments?: string;
  price: number;
  duration: number;
  _count: {
    applications: number;
    enrollments: number;
  };
}

interface Application {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    price: number;
    applicationFee: number;
  };
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export default function EnhancedAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, coursesRes, applicationsRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/courses", { credentials: "include" }),
        fetch("/api/admin/applications", { credentials: "include" }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsers(usersData.data.users || []);
        }
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          setCourses(coursesData.data.courses || []);
        }
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        if (applicationsData.success) {
          setApplications(applicationsData.data.applications || []);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant={
            value === "ADMIN"
              ? "default"
              : value === "INSTRUCTOR"
              ? "secondary"
              : "outline"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant={
            value === "ACTIVE"
              ? "default"
              : value === "INACTIVE"
              ? "secondary"
              : "destructive"
          }
        >
          {value}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Created", sortable: true },
  ];

  const courseColumns = [
    { key: "title", label: "Title", sortable: true },
    {
      key: "instructor",
      label: "Instructor",
      sortable: true,
      render: (value: any) => value.name,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant={
            value === "PUBLISHED"
              ? "default"
              : value === "APPROVED"
              ? "secondary"
              : value === "PENDING_APPROVAL"
              ? "outline"
              : "destructive"
          }
        >
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: number) => `GH₵${value.toLocaleString()}`,
    },
    { key: "createdAt", label: "Created", sortable: true },
  ];

  const applicationColumns = [
    {
      key: "user",
      label: "Applicant",
      sortable: true,
      render: (value: any) => value.name,
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
      render: (value: any) => value.title,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant={
            value === "APPROVED"
              ? "default"
              : value === "PENDING"
              ? "outline"
              : value === "UNDER_REVIEW"
              ? "secondary"
              : "destructive"
          }
        >
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "submittedAt", label: "Submitted", sortable: true },
  ];

  const userActions = [
    {
      label: "View Details",
      onClick: (user: User) => console.log("View user", user.id),
    },
    {
      label: "Edit User",
      onClick: (user: User) => console.log("Edit user", user.id),
    },
    {
      label: "Suspend User",
      onClick: (user: User) => console.log("Suspend user", user.id),
      variant: "destructive" as const,
    },
  ];

  const courseActions = [
    {
      label: "View Course",
      onClick: (course: Course) => console.log("View course", course.id),
    },
    {
      label: "Approve Course",
      onClick: (course: Course) => console.log("Approve course", course.id),
    },
    {
      label: "Reject Course",
      onClick: (course: Course) => console.log("Reject course", course.id),
      variant: "destructive" as const,
    },
  ];

  const applicationActions = [
    {
      label: "View Application",
      onClick: (app: Application) => console.log("View application", app.id),
    },
    {
      label: "Approve Application",
      onClick: (app: Application) => console.log("Approve application", app.id),
    },
    {
      label: "Reject Application",
      onClick: (app: Application) => console.log("Reject application", app.id),
      variant: "destructive" as const,
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-13">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EnhancedDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="ai-insights">
          <AIInsights />
        </TabsContent>

        <TabsContent value="users">
          <MobileOptimizedTable
            data={users}
            columns={userColumns}
            title="User Management"
            searchPlaceholder="Search users..."
            actions={userActions}
            pagination={{
              page: 1,
              limit: 20,
              total: users.length,
              onPageChange: (page) => console.log("Page changed", page),
            }}
          />
        </TabsContent>

        <TabsContent value="courses">
          <MobileOptimizedTable
            data={courses}
            columns={courseColumns}
            title="Course Management"
            searchPlaceholder="Search courses..."
            actions={courseActions}
            pagination={{
              page: 1,
              limit: 20,
              total: courses.length,
              onPageChange: (page) => console.log("Page changed", page),
            }}
          />
        </TabsContent>

        <TabsContent value="applications">
          <MobileOptimizedTable
            data={applications}
            columns={applicationColumns}
            title="Application Management"
            searchPlaceholder="Search applications..."
            actions={applicationActions}
            pagination={{
              page: 1,
              limit: 20,
              total: applications.length,
              onPageChange: (page) => console.log("Page changed", page),
            }}
          />
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowManager />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  System Monitoring
                </h1>
                <p className="text-gray-600">
                  Real-time system health and performance monitoring
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemHealth />
              <PerformanceMonitor />
            </div>

            <UserBehaviorAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="reporting">
          <AdvancedReporting />
        </TabsContent>

        <TabsContent value="integrations">
          <ThirdPartyIntegrations />
        </TabsContent>

        <TabsContent value="testing">
          <AutomatedTesting />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              System Settings
            </h3>
            <p className="text-gray-600">
              System configuration and settings will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
