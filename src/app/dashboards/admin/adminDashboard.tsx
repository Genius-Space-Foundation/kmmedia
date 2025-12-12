"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserDropdown from "@/components/user-dropdown";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import EnhancedDashboard from "@/components/admin/dashboard/EnhancedDashboard";
import MobileOptimizedTable from "@/components/admin/responsive/MobileOptimizedTable";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";
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
import { Checkbox } from "@/components/ui/checkbox";

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
  payments: {
    applicationFee: {
      status: "PENDING" | "PAID" | "FAILED";
      amount: number;
      paidAt?: string;
    };
  };
}

// interface Payment {
//   id: string;
//   user: {
//     name: string;
//     email: string;
//   };
//   course?: {
//     title: string;
//   };
//   type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
//   amount: number;
//   status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
//   method: "PAYSTACK" | "MANUAL" | "BANK_TRANSFER";
//   reference: string;
//   createdAt: string;
//   paidAt?: string;
// }

// interface SystemConfig {
//   applicationFeeDefault: number;
//   paystackPublicKey: string;
//   paystackSecretKey: string;
//   installmentPlans: {
//     id: string;
//     name: string;
//     numberOfInstallments: number;
//     firstPaymentPercentage: number;
//   }[];
//   emailTemplates: {
//     applicationApproved: string;
//     applicationRejected: string;
//     paymentReminder: string;
//   };
// }

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalCourses: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // User Management States
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState({
    role: "ALL",
    status: "ALL",
    search: "",
    dateRange: "ALL",
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  }>({ name: "", email: "", role: "STUDENT" });

  // Advanced User Management States
  const [userActivity, setUserActivity] = useState<
    Array<{ action: string; timestamp: string; type: string }>
  >([]);
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin?: string;
    profile?: {
      id?: string;
      bio?: string;
      avatar?: string;
      phone?: string;
      address?: string;
      dateOfBirth?: string;
      expertise?: string[];
      experience?: number;
      qualifications?: string;
      employmentStatus?: string;
      emergencyContact?: string;
    };
  } | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [bulkUserAction, setBulkUserAction] = useState("");
  const [userBulkActionLoading, setUserBulkActionLoading] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Course Management States
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseFilter, setCourseFilter] = useState({
    status: "ALL",
    category: "ALL",
    search: "",
  });
  const [bulkAction, setBulkAction] = useState("");
  const [approvalComments, setApprovalComments] = useState("");

  // Application Management States
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [applicationFilter, setApplicationFilter] = useState({
    status: "ALL",
    search: "",
  });
  const [showApplicationDetails, setShowApplicationDetails] = useState<
    string | null
  >(null);

  // Payment Management States
  const [paymentFilter, setPaymentFilter] = useState({
    type: "ALL",
    status: "ALL",
    search: "",
  });
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [manualPayment, setManualPayment] = useState({
    userId: "",
    courseId: "",
    amount: 0,
    type: "TUITION" as "TUITION" | "APPLICATION_FEE" | "INSTALLMENT",
  });
  const [payments, setPayments] = useState<
    Array<{
      id: string;
      user: { name: string };
      course?: { title: string };
      amount: number;
      status: string;
      type: string;
      reference: string;
    }>
  >([]);

  const fetchUserProfile = useCallback(async () => {
    try {
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
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchDashboardData = async () => {
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      // Fetch all data in parallel with Authorization header
      const [coursesRes, applicationsRes, usersRes, paymentsRes, statsRes] =
        await Promise.all([
          fetch("/api/admin/courses", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/admin/applications", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/admin/users", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/admin/payments", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/admin/stats", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

      // Check authentication
      if (
        [coursesRes, applicationsRes, usersRes, paymentsRes, statsRes].some(
          (res) => res.status === 401
        )
      ) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      // Parse responses
      const [
        coursesData,
        applicationsData,
        usersData,
        paymentsData,
        statsData,
      ] = await Promise.all([
        coursesRes.json().catch(() => ({ success: false, data: [] })),
        applicationsRes.json().catch(() => ({ success: false, data: [] })),
        usersRes.json().catch(() => ({ success: false, data: [] })),
        paymentsRes.json().catch(() => ({ success: false, data: [] })),
        statsRes.json().catch(() => ({ success: false, data: {} })),
      ]);

      // Update state with fetched data
      if (
        coursesData.success &&
        coursesData.data &&
        Array.isArray(coursesData.data.courses)
      ) {
        setCourses(coursesData.data.courses);
        console.log(
          "Courses loaded successfully:",
          coursesData.data.courses.length
        );
      } else {
        console.log(
          "Courses API failed or returned invalid data:",
          coursesData
        );
        // Add sample courses data for demonstration
        setCourses([
          {
            id: "1",
            title: "Digital Media Production",
            instructor: { name: "Jane Smith" },
            status: "PUBLISHED",
            category: "MEDIA_PRODUCTION",
            price: 500,
          },
          {
            id: "2",
            title: "Broadcast Journalism",
            instructor: { name: "Mike Johnson" },
            status: "PENDING_APPROVAL",
            category: "JOURNALISM",
            price: 750,
          },
          {
            id: "3",
            title: "Photography Fundamentals",
            instructor: { name: "Sarah Wilson" },
            status: "APPROVED",
            category: "PHOTOGRAPHY",
            price: 300,
          },
        ] as Course[]);
      }

      if (
        applicationsData.success &&
        applicationsData.data &&
        Array.isArray(applicationsData.data.applications)
      ) {
        setApplications(applicationsData.data.applications);
        console.log(
          "Applications loaded successfully:",
          applicationsData.data.applications.length
        );
      } else {
        // Add sample applications data for demonstration
        setApplications([
          {
            id: "1",
            user: { name: "John Doe" },
            course: { title: "Digital Media Production", price: 500 },
            status: "PENDING",
            submittedAt: "2024-01-20",
          },
          {
            id: "2",
            user: { name: "David Brown" },
            course: { title: "Broadcast Journalism", price: 750 },
            status: "APPROVED",
            submittedAt: "2024-01-18",
          },
          {
            id: "3",
            user: { name: "Alice Green" },
            course: { title: "Photography Fundamentals", price: 300 },
            status: "REJECTED",
            submittedAt: "2024-01-15",
          },
        ] as Application[]);
      }

      if (
        usersData.success &&
        usersData.data &&
        Array.isArray(usersData.data.users)
      ) {
        setUsers(usersData.data.users);
        console.log("Users loaded successfully:", usersData.data.users.length);
      } else {
        console.log("Users API failed or returned invalid data:", usersData);
        // Add sample users data for demonstration
        setUsers([
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "STUDENT",
            status: "ACTIVE",
            createdAt: "2024-01-15",
            profile: { bio: "Passionate about digital media" },
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "INSTRUCTOR",
            status: "ACTIVE",
            createdAt: "2024-01-10",
            profile: { bio: "Experienced media production instructor" },
          },
          {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "STUDENT",
            status: "INACTIVE",
            createdAt: "2024-01-20",
            profile: { bio: "Learning broadcast journalism" },
          },
          {
            id: "4",
            name: "Sarah Wilson",
            email: "sarah@example.com",
            role: "INSTRUCTOR",
            status: "ACTIVE",
            createdAt: "2024-01-05",
            profile: { bio: "Professional photographer and instructor" },
          },
          {
            id: "5",
            name: "David Brown",
            email: "david@example.com",
            role: "STUDENT",
            status: "ACTIVE",
            createdAt: "2024-01-25",
            profile: { bio: "Aspiring journalist" },
          },
        ] as User[]);
      }

      if (
        paymentsData.success &&
        paymentsData.data &&
        Array.isArray(paymentsData.data.payments)
      ) {
        setPayments(paymentsData.data.payments);
        console.log(
          "Payments loaded successfully:",
          paymentsData.data.payments.length
        );
      } else {
        // Add sample payments data for demonstration
        setPayments([
          {
            id: "1",
            user: { name: "John Doe" },
            course: { title: "Digital Media Production" },
            amount: 500,
            status: "PAID",
            type: "TUITION",
            reference: "PAY-001",
          },
          {
            id: "2",
            user: { name: "David Brown" },
            course: { title: "Broadcast Journalism" },
            amount: 750,
            status: "PENDING",
            type: "TUITION",
            reference: "PAY-002",
          },
          {
            id: "3",
            user: { name: "Alice Green" },
            amount: 50,
            status: "PAID",
            type: "APPLICATION_FEE",
            reference: "PAY-003",
          },
        ] as typeof payments);
      }

      // Update stats (use mock data if API not available)
      if (statsData.success) {
        setStats(statsData.data);
      } else {
        setStats({
          totalUsers: 150,
          totalInstructors: 25,
          totalStudents: 125,
          totalCourses: 45,
          pendingApplications:
            applicationsData.success &&
            applicationsData.data &&
            applicationsData.data.applications
              ? applicationsData.data.applications.filter(
                  (app: Application) => app.status === "PENDING"
                ).length
              : 12,
          totalRevenue: 2500000,
          monthlyRevenue: 350000,
          pendingPayments: 8,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set fallback data and ensure all states are arrays
      setCourses([]);
      setApplications([]);
      setUsers([]);
      // setPayments([]);
      setStats({
        totalUsers: 150,
        totalInstructors: 25,
        totalStudents: 125,
        totalCourses: 45,
        pendingApplications: 12,
        totalRevenue: 2500000,
        monthlyRevenue: 350000,
        pendingPayments: 8,
      });
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newUser),
      });
      const result = await response.json();
      if (result.success) {
        setUsers([result.data, ...users]);
        setShowCreateUser(false);
        setNewUser({ name: "", email: "", role: "STUDENT" });
      } else {
        alert(result.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user");
    }
  };

  const handleBulkUserAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    setUserBulkActionLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action, userIds: selectedUsers }),
      });
      const result = await response.json();
      if (result.success) {
        alert(
          `Bulk ${action} completed successfully for ${selectedUsers.length} users`
        );
        fetchDashboardData();
        setSelectedUsers([]);
        setBulkUserAction("");
      } else {
        alert(result.message || "Failed to perform bulk action");
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      alert("An error occurred while performing bulk action");
    } finally {
      setUserBulkActionLoading(false);
    }
  };

  // Advanced user management functions
  const handleUserDetails = async (userId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserDetails(userData.data);
        setShowUserDetails(true);
      } else {
        alert("Failed to fetch user details");
      }
    } catch (error) {
      console.error("User details error:", error);
      alert("An error occurred while fetching user details");
    }
  };

  const handleUserActivity = async (userId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}/activity`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const activityData = await response.json();
        setUserActivity(activityData.data);
      } else {
        alert("Failed to fetch user activity");
      }
    } catch (error) {
      console.error("User activity error:", error);
      alert("An error occurred while fetching user activity");
    }
  };

  const handleExportUsers = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch("/api/admin/users/export", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to export users");
      }
    } catch (error) {
      console.error("Export users error:", error);
      alert("An error occurred while exporting users");
    }
  };

  // User Profile Functions
  const handleUpdateProfile = async (data: {
    name?: string;
    email?: string;
    bio?: string;
  }) => {
    try {
      const response = await makeAuthenticatedRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        alert("Profile updated successfully");
      } else {
        alert(result.message || "Failed to update profile");
        if (result.message === "Invalid token") {
          clearAuthTokens();
          router.push("/auth/login");
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
      if (
        error instanceof Error &&
        error.message.includes("No valid authentication token")
      ) {
        clearAuthTokens();
        router.push("/auth/login");
      } else {
        alert("Failed to update profile");
      }
    }
  };

  const handleUpdatePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await makeAuthenticatedRequest("/api/user/password", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert("Password updated successfully");
      } else {
        alert(result.message || "Failed to update password");
        if (result.message === "Invalid token") {
          clearAuthTokens();
          router.push("/auth/login");
        }
      }
    } catch (error) {
      console.error("Update password error:", error);
      if (
        error instanceof Error &&
        error.message.includes("No valid authentication token")
      ) {
        clearAuthTokens();
        router.push("/auth/login");
      } else {
        alert("Failed to update password");
      }
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/auth/login");
  };

  const handleUserStatusChange = async (userId: string, status: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, status: status as User["status"] }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  // Course Management Functions
  const handleCourseApproval = async (
    courseId: string,
    action: "approve" | "reject",
    comments?: string
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action, comments }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("You need to log in first. Redirecting to login page...");
          window.location.href = "/auth/login";
          return;
        }

        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        alert(`Course ${action}d successfully!`);
        fetchDashboardData();
        setApprovalComments("");
      } else {
        alert(result.message || "Failed to update course status");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while updating the course";
      alert(errorMessage);
    }
  };

  const handleBulkCourseAction = async () => {
    if (selectedCourses.length === 0 || !bulkAction) return;
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch("/api/admin/courses/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: bulkAction,
          courseIds: selectedCourses,
          comments: approvalComments,
        }),
      });
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
        setSelectedCourses([]);
        setBulkAction("");
        setApprovalComments("");
      } else {
        alert(result.message || "Failed to perform bulk action");
      }
    } catch (error) {
      console.error("Error performing bulk course action:", error);
    }
  };

  // Application Management Functions
  const handleApplicationApproval = async (
    applicationId: string,
    action: "approve" | "reject" | "APPROVED" | "REJECTED" | "UNDER_REVIEW",
    notes?: string
  ) => {
    try {
      // Handle both string status values and action words
      let status: string;
      if (action === "approve" || action === "APPROVED") {
        status = "APPROVED";
      } else if (action === "reject" || action === "REJECTED") {
        status = "REJECTED";
      } else {
        status = action; // Already a status value
      }

      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewNotes: notes,
        }),
      });

      if (response.status === 401) {
        alert("You need to log in first. Redirecting to login page...");
        router.push("/auth/login");
        return;
      }

      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
        // Show success message
        alert(`Application ${status.toLowerCase()} successfully`);
      } else {
        alert(result.message || "Failed to update application status");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      alert("An error occurred while updating the application");
    }
  };

  const handleBulkApplicationAction = async (
    action: string,
    notes?: string
  ) => {
    if (selectedApplications.length === 0) return;
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch("/api/admin/applications/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action,
          applicationIds: selectedApplications,
          reviewNotes: notes,
        }),
      });
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
        setSelectedApplications([]);
      } else {
        alert(result.message || "Failed to perform bulk action");
      }
    } catch (error) {
      console.error("Error performing bulk application action:", error);
    }
  };

  // Payment Management Functions
  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch("/api/admin/payments/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(manualPayment),
      });
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
        setShowManualPayment(false);
        setManualPayment({
          userId: "",
          courseId: "",
          amount: 0,
          type: "TUITION",
        });
      } else {
        alert(result.message || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording manual payment:", error);
    }
  };

  const handlePaymentRefund = async (paymentId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
      } else {
        alert(result.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
    }
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-red-100 text-red-800",
      DRAFT: "bg-yellow-100 text-yellow-800",
      PENDING_APPROVAL: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      PUBLISHED: "bg-purple-100 text-purple-800",
      REJECTED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      UNDER_REVIEW: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const exportData = async (type: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(`/api/admin/export/${type}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="relative">
            <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-accent rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-brand-gradient">
              Loading Admin Dashboard
            </h2>
            <p className="text-gray-600 font-medium">
              Preparing your comprehensive management interface...
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral-50 via-brand-neutral-100 to-brand-neutral-200 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-tertiary/3 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Modern Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-brand-gradient-hero rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-2xl">⚡</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-brand-gradient-hero tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-brand-text-secondary font-medium">
                  Comprehensive platform management & analytics
                </p>
                <div className="flex items-center space-x-2 text-sm text-brand-text-muted">
                  <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"></div>
                  <span>Live System Status</span>
                </div>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                {/* Notification Center */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 rounded-xl"
                  >
                    🔔
                  </Button>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    3
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                </div>
                <UserDropdown
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onUpdatePassword={handleUpdatePassword}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">👥</span>
                </div>
                <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Total Users
                </CardTitle>
                <div className="text-2xl font-bold text-brand-text-primary mt-1">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-xs text-brand-secondary font-medium">
                  +12% this month
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">👨‍🏫</span>
                </div>
                <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Instructors
                </CardTitle>
                <div className="text-2xl font-bold text-brand-text-primary mt-1">
                  {stats.totalInstructors.toLocaleString()}
                </div>
                <div className="text-xs text-brand-secondary font-medium">
                  +8% this month
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">🎓</span>
                </div>
                <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Students
                </CardTitle>
                <div className="text-2xl font-bold text-brand-text-primary mt-1">
                  {stats.totalStudents.toLocaleString()}
                </div>
                <div className="text-xs text-brand-accent font-medium">
                  +15% this month
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-tertiary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">📚</span>
                </div>
                <div className="w-3 h-3 bg-brand-tertiary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Courses
                </CardTitle>
                <div className="text-2xl font-bold text-brand-text-primary mt-1">
                  {stats.totalCourses.toLocaleString()}
                </div>
                <div className="text-xs text-brand-tertiary font-medium">
                  +5% this month
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">⏳</span>
                </div>
                <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Pending Apps
                </CardTitle>
                <div className="text-2xl font-bold text-brand-text-primary mt-1">
                  {stats.pendingApplications.toLocaleString()}
                </div>
                <div className="text-xs text-brand-accent font-medium">
                  Needs attention
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">💰</span>
                </div>
                <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Total Revenue
                </CardTitle>
                <div className="text-xl font-bold text-brand-text-primary mt-1">
                  ₵{(stats.totalRevenue / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-brand-secondary font-medium">
                  +18% this month
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Monthly Rev
                </CardTitle>
                <div className="text-xl font-bold text-brand-text-primary mt-1">
                  ₵{(stats.monthlyRevenue / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-brand-primary font-medium">
                  +22% this month
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-brand-gradient-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">💳</span>
                </div>
                <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                  Pending Pay
                </CardTitle>
                <div className="text-2xl font-bold text-brand-text-primary mt-1">
                  {stats.pendingPayments.toLocaleString()}
                </div>
                <div className="text-xs text-brand-accent font-medium">
                  Requires review
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Modern Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-6 bg-brand-surface/80 backdrop-blur-xl border border-brand-border/50 rounded-2xl p-2 shadow-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-brand-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Overview</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-brand-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>👥</span>
                  <span>Users</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-brand-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>📚</span>
                  <span>Courses</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-brand-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Applications</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-brand-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>💳</span>
                  <span>Payments</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-brand-gradient-hero data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>⚙️</span>
                  <span>Settings</span>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Course Approvals */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">📚</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          Course Submissions
                        </CardTitle>
                        <CardDescription className="text-gray-600 font-medium">
                          Recent courses awaiting approval
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("courses")}
                      className="bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300"
                    >
                      View All →
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(courses || []).slice(0, 5).map((course, index) => (
                      <div
                        key={course.id}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl border border-gray-100/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            by {course.instructor.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                course.status
                              )}`}
                            >
                              {course.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:scale-105 transition-all duration-200"
                            onClick={() =>
                              handleCourseApproval(course.id, "approve")
                            }
                          >
                            ✅ Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-semibold hover:scale-105 transition-all duration-200"
                            onClick={() =>
                              handleCourseApproval(course.id, "reject")
                            }
                          >
                            ❌ Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!courses || courses.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📚</span>
                        </div>
                        <p className="font-medium">No course submissions</p>
                        <p className="text-sm">New courses will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border-b border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">📋</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          Applications
                        </CardTitle>
                        <CardDescription className="text-gray-600 font-medium">
                          Student course applications
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("applications")}
                      className="bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300"
                    >
                      View All →
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(applications || [])
                      .slice(0, 5)
                      .map((application, index) => (
                        <div
                          key={application.id}
                          className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl border border-gray-100/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">
                              {application.user.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {application.course.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                  application.status
                                )}`}
                              >
                                {application.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  application.submittedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:scale-105 transition-all duration-200"
                              onClick={() =>
                                handleApplicationApproval(
                                  application.id,
                                  "approve"
                                )
                              }
                            >
                              ✅ Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-semibold hover:scale-105 transition-all duration-200"
                              onClick={() =>
                                handleApplicationApproval(
                                  application.id,
                                  "reject"
                                )
                              }
                            >
                              ❌ Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    {(!applications || applications.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📋</span>
                        </div>
                        <p className="font-medium">No applications</p>
                        <p className="text-sm">
                          New applications will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-b border-gray-100/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">👥</span>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">
                        User Management
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium text-lg">
                        Manage instructors, students, and administrators
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleExportUsers}
                      variant="outline"
                      className="bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold"
                    >
                      📊 Export Users
                    </Button>
                    {selectedUsers.length > 0 && (
                      <div className="flex space-x-2">
                        <Select
                          value={bulkUserAction}
                          onValueChange={setBulkUserAction}
                        >
                          <SelectTrigger className="w-48 bg-white/80 border-brand-primary/20">
                            <SelectValue placeholder="Bulk Actions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activate">
                              ✅ Activate
                            </SelectItem>
                            <SelectItem value="deactivate">
                              ⏸️ Deactivate
                            </SelectItem>
                            <SelectItem value="suspend">🚫 Suspend</SelectItem>
                            <SelectItem value="delete">🗑️ Delete</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleBulkUserAction(bulkUserAction)}
                          disabled={!bulkUserAction || userBulkActionLoading}
                          className="bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold"
                        >
                          {userBulkActionLoading ? "Processing..." : "Apply"}
                        </Button>
                      </div>
                    )}
                    <Dialog
                      open={showCreateUser}
                      onOpenChange={setShowCreateUser}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-brand-gradient hover:shadow-lg text-white font-semibold">
                          ➕ Create User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
                        <DialogHeader className="text-center pb-6">
                          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl">👤</span>
                          </div>
                          <DialogTitle className="text-2xl font-bold text-gray-900">
                            Create New User
                          </DialogTitle>
                          <p className="text-gray-600">
                            Add a new user to the system
                          </p>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="name"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              value={newUser.name}
                              onChange={(e) =>
                                setNewUser({ ...newUser, name: e.target.value })
                              }
                              required
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) =>
                                setNewUser({
                                  ...newUser,
                                  email: e.target.value,
                                })
                              }
                              required
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="role"
                              className="text-sm font-semibold text-gray-700"
                            >
                              User Role
                            </Label>
                            <Select
                              value={newUser.role}
                              onValueChange={(value) =>
                                setNewUser({
                                  ...newUser,
                                  role: value as
                                    | "STUDENT"
                                    | "INSTRUCTOR"
                                    | "ADMIN",
                                })
                              }
                            >
                              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STUDENT">
                                  🎓 Student
                                </SelectItem>
                                <SelectItem value="INSTRUCTOR">
                                  👨‍🏫 Instructor
                                </SelectItem>
                                <SelectItem value="ADMIN">⚡ Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="submit"
                              className="flex-1 bg-brand-gradient hover:shadow-lg text-white font-semibold h-12 rounded-xl"
                            >
                              Create User
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCreateUser(false)}
                              className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-semibold"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Modern Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Search Users
                    </Label>
                    <Input
                      placeholder="Search by name or email..."
                      value={userFilter.search}
                      onChange={(e) =>
                        setUserFilter({ ...userFilter, search: e.target.value })
                      }
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Role
                    </Label>
                    <Select
                      value={userFilter.role}
                      onValueChange={(value: string) =>
                        setUserFilter({ ...userFilter, role: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">👥 All Roles</SelectItem>
                        <SelectItem value="STUDENT">🎓 Students</SelectItem>
                        <SelectItem value="INSTRUCTOR">
                          👨‍🏫 Instructors
                        </SelectItem>
                        <SelectItem value="ADMIN">⚡ Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Status
                    </Label>
                    <Select
                      value={userFilter.status}
                      onValueChange={(value: string) =>
                        setUserFilter({ ...userFilter, status: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">📊 All Status</SelectItem>
                        <SelectItem value="ACTIVE">✅ Active</SelectItem>
                        <SelectItem value="INACTIVE">⏸️ Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">🚫 Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Modern Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl border border-brand-primary/20 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">👥</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedUsers.length} users selected
                        </p>
                        <p className="text-sm text-gray-600">
                          Choose an action to apply to selected users
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => handleBulkUserAction("activate")}
                        className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold px-4 py-2 rounded-xl"
                      >
                        ✅ Activate
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBulkUserAction("deactivate")}
                        className="bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold px-4 py-2 rounded-xl"
                      >
                        ⏸️ Deactivate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBulkUserAction("suspend")}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl"
                      >
                        🚫 Suspend
                      </Button>
                    </div>
                  </div>
                )}

                {/* Modern User List */}
                <div className="space-y-4">
                  {users
                    .filter((user) => {
                      const matchesSearch =
                        user.name
                          .toLowerCase()
                          .includes(userFilter.search.toLowerCase()) ||
                        user.email
                          .toLowerCase()
                          .includes(userFilter.search.toLowerCase());
                      const matchesRole =
                        userFilter.role === "ALL" ||
                        user.role === userFilter.role;
                      const matchesStatus =
                        userFilter.status === "ALL" ||
                        user.status === userFilter.status;
                      return matchesSearch && matchesRole && matchesStatus;
                    })
                    .map((user, index) => (
                      <div
                        key={user.id}
                        className="group flex items-center justify-between p-6 bg-gradient-to-r from-white/80 to-gray-50/50 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-6">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== user.id)
                                );
                              }
                            }}
                            className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary"
                          />
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {user.name}
                            </h4>
                            <p className="text-sm text-gray-600 font-medium">
                              {user.email}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Badge
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                  user.role
                                )}`}
                              >
                                {user.role === "STUDENT"
                                  ? "🎓"
                                  : user.role === "INSTRUCTOR"
                                  ? "👨‍🏫"
                                  : "⚡"}{" "}
                                {user.role}
                              </Badge>
                              <Badge
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                  user.status
                                )}`}
                              >
                                {user.status === "ACTIVE"
                                  ? "✅"
                                  : user.status === "INACTIVE"
                                  ? "⏸️"
                                  : "🚫"}{" "}
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserDetails(user.id)}
                            className="bg-white/80 hover:bg-brand-primary hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                          >
                            👁️ Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserActivity(user.id)}
                            className="bg-white/80 hover:bg-brand-secondary hover:text-white border-brand-secondary/20 hover:border-transparent transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                          >
                            📊 Activity
                          </Button>
                          <Select
                            value={user.status}
                            onValueChange={(value: string) =>
                              handleUserStatusChange(user.id, value)
                            }
                          >
                            <SelectTrigger className="w-32 h-10 bg-white/80 border-brand-primary/20 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">✅ Active</SelectItem>
                              <SelectItem value="INACTIVE">
                                ⏸️ Inactive
                              </SelectItem>
                              <SelectItem value="SUSPENDED">
                                🚫 Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-brand-accent hover:text-white border-brand-accent/20 hover:border-transparent transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                          >
                            ✏️ Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  {users.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">👥</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or filter criteria
                      </p>
                      <Button
                        onClick={() => setShowCreateUser(true)}
                        className="bg-brand-gradient hover:shadow-lg text-white font-semibold px-6 py-3 rounded-xl"
                      >
                        ➕ Create First User
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border-b border-gray-100/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📚</span>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">
                        Course Management
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium text-lg">
                        Manage courses, approvals, and course analytics
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => exportData("courses")}
                      variant="outline"
                      className="bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold"
                    >
                      📊 Export Courses
                    </Button>
                    {selectedCourses.length > 0 && (
                      <div className="flex space-x-2">
                        <Select
                          value={bulkAction}
                          onValueChange={setBulkAction}
                        >
                          <SelectTrigger className="w-48 bg-white/80 border-brand-primary/20">
                            <SelectValue placeholder="Bulk Actions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approve">
                              ✅ Approve Selected
                            </SelectItem>
                            <SelectItem value="reject">
                              ❌ Reject Selected
                            </SelectItem>
                            <SelectItem value="publish">
                              📢 Publish Selected
                            </SelectItem>
                            <SelectItem value="unpublish">
                              📝 Unpublish Selected
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => handleBulkCourseAction()}
                          disabled={!bulkAction}
                          className="bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Course Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Search Courses
                    </Label>
                    <Input
                      placeholder="Search by title or instructor..."
                      value={courseFilter.search}
                      onChange={(e) =>
                        setCourseFilter({
                          ...courseFilter,
                          search: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Status
                    </Label>
                    <Select
                      value={courseFilter.status}
                      onValueChange={(value: string) =>
                        setCourseFilter({ ...courseFilter, status: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">📊 All Status</SelectItem>
                        <SelectItem value="DRAFT">📝 Draft</SelectItem>
                        <SelectItem value="PENDING_APPROVAL">
                          ⏳ Pending Approval
                        </SelectItem>
                        <SelectItem value="APPROVED">✅ Approved</SelectItem>
                        <SelectItem value="PUBLISHED">📢 Published</SelectItem>
                        <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Category
                    </Label>
                    <Select
                      value={courseFilter.category}
                      onValueChange={(value: string) =>
                        setCourseFilter({ ...courseFilter, category: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">📚 All Categories</SelectItem>
                        <SelectItem value="MEDIA_PRODUCTION">
                          🎬 Media Production
                        </SelectItem>
                        <SelectItem value="JOURNALISM">
                          📰 Journalism
                        </SelectItem>
                        <SelectItem value="BROADCASTING">
                          📺 Broadcasting
                        </SelectItem>
                        <SelectItem value="DIGITAL_MARKETING">
                          💻 Digital Marketing
                        </SelectItem>
                        <SelectItem value="PHOTOGRAPHY">
                          📸 Photography
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedCourses.length > 0 && (
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-2xl border border-brand-primary/20 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📚</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedCourses.length} courses selected
                        </p>
                        <p className="text-sm text-gray-600">
                          Choose an action to apply to selected courses
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => handleBulkCourseAction()}
                        className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold px-4 py-2 rounded-xl"
                      >
                        ✅ Apply Action
                      </Button>
                    </div>
                  </div>
                )}

                {/* Course List */}
                <div className="space-y-4">
                  {courses
                    .filter((course) => {
                      const matchesSearch =
                        course.title
                          .toLowerCase()
                          .includes(courseFilter.search.toLowerCase()) ||
                        course.instructor.name
                          .toLowerCase()
                          .includes(courseFilter.search.toLowerCase());
                      const matchesStatus =
                        courseFilter.status === "ALL" ||
                        course.status === courseFilter.status;
                      const matchesCategory =
                        courseFilter.category === "ALL" ||
                        course.category === courseFilter.category;
                      return matchesSearch && matchesStatus && matchesCategory;
                    })
                    .map((course, index) => (
                      <div
                        key={course.id}
                        className="group flex items-center justify-between p-6 bg-gradient-to-r from-white/80 to-gray-50/50 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-6">
                          <Checkbox
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedCourses([
                                  ...selectedCourses,
                                  course.id,
                                ]);
                              } else {
                                setSelectedCourses(
                                  selectedCourses.filter(
                                    (id) => id !== course.id
                                  )
                                );
                              }
                            }}
                            className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary"
                          />
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              📚
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 font-medium">
                              by {course.instructor.name}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Badge
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                  course.status
                                )}`}
                              >
                                {course.status.replace("_", " ")}
                              </Badge>
                              <Badge className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                {course.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ₵{course.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-brand-primary hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                          >
                            👁️ View
                          </Button>
                          {course.status === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold px-4 py-2 rounded-xl"
                                onClick={() =>
                                  handleCourseApproval(course.id, "approve")
                                }
                              >
                                ✅ Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl"
                                onClick={() =>
                                  handleCourseApproval(course.id, "reject")
                                }
                              >
                                ❌ Reject
                              </Button>
                            </>
                          )}
                          <Select
                            value={course.status}
                            onValueChange={(value: string) =>
                              handleCourseApproval(
                                course.id,
                                value as "approve" | "reject"
                              )
                            }
                          >
                            <SelectTrigger className="w-32 h-10 bg-white/80 border-brand-primary/20 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="APPROVED">
                                ✅ Approve
                              </SelectItem>
                              <SelectItem value="REJECTED">
                                ❌ Reject
                              </SelectItem>
                              <SelectItem value="PUBLISHED">
                                📢 Publish
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  {courses.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📚</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No courses found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 border-b border-gray-100/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📋</span>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">
                        Application Management
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium text-lg">
                        Review and process student course applications
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => exportData("applications")}
                      variant="outline"
                      className="bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold"
                    >
                      📊 Export Applications
                    </Button>
                    {selectedApplications.length > 0 && (
                      <div className="flex space-x-2">
                        <Select
                          value={bulkUserAction}
                          onValueChange={setBulkUserAction}
                        >
                          <SelectTrigger className="w-48 bg-white/80 border-brand-primary/20">
                            <SelectValue placeholder="Bulk Actions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approve">
                              ✅ Approve Selected
                            </SelectItem>
                            <SelectItem value="reject">
                              ❌ Reject Selected
                            </SelectItem>
                            <SelectItem value="review">
                              👁️ Mark for Review
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() =>
                            handleBulkApplicationAction(bulkUserAction)
                          }
                          disabled={!bulkUserAction}
                          className="bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Application Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Search Applications
                    </Label>
                    <Input
                      placeholder="Search by student name or course..."
                      value={applicationFilter.search}
                      onChange={(e) =>
                        setApplicationFilter({
                          ...applicationFilter,
                          search: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Status
                    </Label>
                    <Select
                      value={applicationFilter.status}
                      onValueChange={(value: string) =>
                        setApplicationFilter({
                          ...applicationFilter,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">📊 All Status</SelectItem>
                        <SelectItem value="PENDING">⏳ Pending</SelectItem>
                        <SelectItem value="UNDER_REVIEW">
                          👁️ Under Review
                        </SelectItem>
                        <SelectItem value="APPROVED">✅ Approved</SelectItem>
                        <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedApplications.length > 0 && (
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📋</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {selectedApplications.length} applications selected
                        </p>
                        <p className="text-sm text-gray-600">
                          Choose an action to apply to selected applications
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => handleBulkApplicationAction("approve")}
                        className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold px-4 py-2 rounded-xl"
                      >
                        ✅ Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBulkApplicationAction("reject")}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl"
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* Application List */}
                <div className="space-y-4">
                  {applications
                    .filter((application) => {
                      const matchesSearch =
                        application.user.name
                          .toLowerCase()
                          .includes(applicationFilter.search.toLowerCase()) ||
                        application.course.title
                          .toLowerCase()
                          .includes(applicationFilter.search.toLowerCase());
                      const matchesStatus =
                        applicationFilter.status === "ALL" ||
                        application.status === applicationFilter.status;
                      return matchesSearch && matchesStatus;
                    })
                    .map((application, index) => (
                      <div
                        key={application.id}
                        className="group flex items-center justify-between p-6 bg-gradient-to-r from-white/80 to-gray-50/50 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-6">
                          <Checkbox
                            checked={selectedApplications.includes(
                              application.id
                            )}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedApplications([
                                  ...selectedApplications,
                                  application.id,
                                ]);
                              } else {
                                setSelectedApplications(
                                  selectedApplications.filter(
                                    (id) => id !== application.id
                                  )
                                );
                              }
                            }}
                            className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary"
                          />
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              📋
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {application.user.name}
                            </h4>
                            <p className="text-sm text-gray-600 font-medium">
                              {application.course.title}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Badge
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                  application.status
                                )}`}
                              >
                                {application.status.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ₵{application.course.price.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  application.submittedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowApplicationDetails(application.id)
                            }
                            className="bg-white/80 hover:bg-brand-primary hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                          >
                            👁️ Details
                          </Button>

                          {/* Show action buttons for PENDING applications - Make them prominent */}
                          {application.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                onClick={() =>
                                  handleApplicationApproval(
                                    application.id,
                                    "approve"
                                  )
                                }
                              >
                                ✅ Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all bg-white"
                                onClick={() =>
                                  handleApplicationApproval(
                                    application.id,
                                    "reject"
                                  )
                                }
                              >
                                ❌ Reject
                              </Button>
                            </>
                          )}

                          {/* Status dropdown - always visible for quick status changes */}
                          <Select
                            value={application.status}
                            onValueChange={(value: string) =>
                              handleApplicationApproval(
                                application.id,
                                value as
                                  | "APPROVED"
                                  | "REJECTED"
                                  | "UNDER_REVIEW"
                                  | "PENDING"
                              )
                            }
                          >
                            <SelectTrigger className="min-w-[140px] h-10 bg-white/80 border-2 border-brand-primary/30 rounded-xl font-semibold hover:border-brand-primary/50 transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">
                                ⏳ Pending
                              </SelectItem>
                              <SelectItem value="UNDER_REVIEW">
                                👁️ Under Review
                              </SelectItem>
                              <SelectItem value="APPROVED">
                                ✅ Approved
                              </SelectItem>
                              <SelectItem value="REJECTED">
                                ❌ Rejected
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  {applications.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📋</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No applications found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}

                  {/* Info message if no pending applications */}
                  {applications.length > 0 &&
                    applications.filter((app) => app.status === "PENDING")
                      .length === 0 &&
                    applicationFilter.status === "ALL" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          ℹ️ No pending applications. Use the status dropdown on
                          each application to change its status, or filter by
                          "Pending" to see applications awaiting review.
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-accent/10 to-brand-primary/10 border-b border-gray-100/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-accent to-brand-primary rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">💳</span>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900">
                        Payment Management
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium text-lg">
                        Track payments, process refunds, and manage financial
                        transactions
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => exportData("payments")}
                      variant="outline"
                      className="bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold"
                    >
                      📊 Export Payments
                    </Button>
                    <Dialog
                      open={showManualPayment}
                      onOpenChange={setShowManualPayment}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-brand-gradient hover:shadow-lg text-white font-semibold">
                          ➕ Manual Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
                        <DialogHeader className="text-center pb-6">
                          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl">💳</span>
                          </div>
                          <DialogTitle className="text-2xl font-bold text-gray-900">
                            Record Manual Payment
                          </DialogTitle>
                          <p className="text-gray-600">
                            Add a manual payment entry
                          </p>
                        </DialogHeader>
                        <form
                          onSubmit={handleManualPayment}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <Label
                              htmlFor="userId"
                              className="text-sm font-semibold text-gray-700"
                            >
                              User ID
                            </Label>
                            <Input
                              id="userId"
                              value={manualPayment.userId}
                              onChange={(e) =>
                                setManualPayment({
                                  ...manualPayment,
                                  userId: e.target.value,
                                })
                              }
                              required
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                              placeholder="Enter user ID"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="courseId"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Course ID
                            </Label>
                            <Input
                              id="courseId"
                              value={manualPayment.courseId}
                              onChange={(e) =>
                                setManualPayment({
                                  ...manualPayment,
                                  courseId: e.target.value,
                                })
                              }
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                              placeholder="Enter course ID (optional)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="amount"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Amount (₵)
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              value={manualPayment.amount}
                              onChange={(e) =>
                                setManualPayment({
                                  ...manualPayment,
                                  amount: Number(e.target.value),
                                })
                              }
                              required
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                              placeholder="Enter amount"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="type"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Payment Type
                            </Label>
                            <Select
                              value={manualPayment.type}
                              onValueChange={(value) =>
                                setManualPayment({
                                  ...manualPayment,
                                  type: value as
                                    | "TUITION"
                                    | "APPLICATION_FEE"
                                    | "INSTALLMENT",
                                })
                              }
                            >
                              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TUITION">
                                  🎓 Tuition
                                </SelectItem>
                                <SelectItem value="APPLICATION_FEE">
                                  📋 Application Fee
                                </SelectItem>
                                <SelectItem value="INSTALLMENT">
                                  💳 Installment
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="submit"
                              className="flex-1 bg-brand-gradient hover:shadow-lg text-white font-semibold h-12 rounded-xl"
                            >
                              Record Payment
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowManualPayment(false)}
                              className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-semibold"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Payment Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Search Payments
                    </Label>
                    <Input
                      placeholder="Search by user name or reference..."
                      value={paymentFilter.search}
                      onChange={(e) =>
                        setPaymentFilter({
                          ...paymentFilter,
                          search: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Type
                    </Label>
                    <Select
                      value={paymentFilter.type}
                      onValueChange={(value: string) =>
                        setPaymentFilter({ ...paymentFilter, type: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">💳 All Types</SelectItem>
                        <SelectItem value="APPLICATION_FEE">
                          📋 Application Fee
                        </SelectItem>
                        <SelectItem value="TUITION">🎓 Tuition</SelectItem>
                        <SelectItem value="INSTALLMENT">
                          💳 Installment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Filter by Status
                    </Label>
                    <Select
                      value={paymentFilter.status}
                      onValueChange={(value: string) =>
                        setPaymentFilter({ ...paymentFilter, status: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">📊 All Status</SelectItem>
                        <SelectItem value="PENDING">⏳ Pending</SelectItem>
                        <SelectItem value="PAID">✅ Paid</SelectItem>
                        <SelectItem value="FAILED">❌ Failed</SelectItem>
                        <SelectItem value="REFUNDED">🔄 Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment List */}
                <div className="space-y-4">
                  {payments
                    .filter(
                      (payment: {
                        user: { name: string };
                        reference: string;
                        type: string;
                        status: string;
                      }) => {
                        const matchesSearch =
                          payment.user.name
                            .toLowerCase()
                            .includes(paymentFilter.search.toLowerCase()) ||
                          payment.reference
                            .toLowerCase()
                            .includes(paymentFilter.search.toLowerCase());
                        const matchesType =
                          paymentFilter.type === "ALL" ||
                          payment.type === paymentFilter.type;
                        const matchesStatus =
                          paymentFilter.status === "ALL" ||
                          payment.status === paymentFilter.status;
                        return matchesSearch && matchesType && matchesStatus;
                      }
                    )
                    .map(
                      (
                        payment: {
                          id: string;
                          user: { name: string };
                          course?: { title: string };
                          amount: number;
                          status: string;
                          type: string;
                          reference: string;
                        },
                        index: number
                      ) => (
                        <div
                          key={payment.id}
                          className="group flex items-center justify-between p-6 bg-gradient-to-r from-white/80 to-gray-50/50 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-brand-accent to-brand-primary rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-lg font-bold text-white">
                                💳
                              </span>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {payment.user.name}
                              </h4>
                              <p className="text-sm text-gray-600 font-medium">
                                {payment.course?.title || "Application Fee"}
                              </p>
                              <div className="flex items-center space-x-3">
                                <Badge
                                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {payment.status}
                                </Badge>
                                <Badge className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {payment.type.replace("_", " ")}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  ₵{payment.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/80 hover:bg-brand-primary hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 font-semibold px-4 py-2 rounded-xl"
                            >
                              👁️ View
                            </Button>
                            {payment.status === "PAID" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentRefund(payment.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl"
                              >
                                🔄 Refund
                              </Button>
                            )}
                            <Select
                              value={payment.status}
                              onValueChange={(value: string) =>
                                // Handle status change
                                console.log("Status change:", value)
                              }
                            >
                              <SelectTrigger className="w-32 h-10 bg-white/80 border-brand-primary/20 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">
                                  ⏳ Pending
                                </SelectItem>
                                <SelectItem value="PAID">✅ Paid</SelectItem>
                                <SelectItem value="FAILED">
                                  ❌ Failed
                                </SelectItem>
                                <SelectItem value="REFUNDED">
                                  🔄 Refunded
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )
                    )}
                  {payments.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💳</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No payments found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-b border-gray-100/50">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">⚙️</span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      System Settings
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium text-lg">
                      Configure system settings and manage platform preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* General Settings */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>🔧</span>
                      <span>General Settings</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Platform Name
                        </Label>
                        <Input
                          placeholder="KM Media Training Institute"
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Support Email
                        </Label>
                        <Input
                          placeholder="support@kmmediatraining.com"
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Default Currency
                        </Label>
                        <Select>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                            <SelectValue placeholder="Ghana Cedi (₵)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GHS">
                              🇬🇭 Ghana Cedi (₵)
                            </SelectItem>
                            <SelectItem value="USD">
                              🇺🇸 US Dollar ($)
                            </SelectItem>
                            <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Course Settings */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>📚</span>
                      <span>Course Settings</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Auto-approve Courses
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary" />
                          <span className="text-sm text-gray-600">
                            Automatically approve instructor courses
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Max Course Duration (days)
                        </Label>
                        <Input
                          placeholder="365"
                          type="number"
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Default Application Fee (₵)
                        </Label>
                        <Input
                          placeholder="50"
                          type="number"
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>💳</span>
                      <span>Payment Settings</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Payment Gateway
                        </Label>
                        <Select>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10">
                            <SelectValue placeholder="Paystack" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paystack">
                              💳 Paystack
                            </SelectItem>
                            <SelectItem value="flutterwave">
                              🌊 Flutterwave
                            </SelectItem>
                            <SelectItem value="stripe">💎 Stripe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Enable Installments
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary" />
                          <span className="text-sm text-gray-600">
                            Allow students to pay in installments
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Max Installments
                        </Label>
                        <Input
                          placeholder="6"
                          type="number"
                          className="h-12 rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>🔔</span>
                      <span>Notification Settings</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Email Notifications
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary" />
                            <span className="text-sm text-gray-600">
                              New applications
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary" />
                            <span className="text-sm text-gray-600">
                              Payment confirmations
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary" />
                            <span className="text-sm text-gray-600">
                              System alerts
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          SMS Notifications
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox className="w-5 h-5 rounded-lg border-2 border-brand-primary data-[state=checked]:bg-brand-primary" />
                          <span className="text-sm text-gray-600">
                            Enable SMS notifications
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Settings Button */}
                <div className="flex justify-end pt-8 border-t border-gray-200">
                  <Button className="bg-brand-gradient hover:shadow-lg text-white font-semibold px-8 py-3 rounded-xl">
                    💾 Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modern User Details Modal */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <span className="text-white text-3xl">👤</span>
              </div>
              <DialogTitle className="text-3xl font-bold text-gray-900">
                User Details
              </DialogTitle>
              <p className="text-gray-600">Comprehensive user information</p>
            </DialogHeader>
            {userDetails && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Full Name
                    </Label>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-xl">
                      {userDetails.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-xl">
                      {userDetails.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      User Role
                    </Label>
                    <Badge
                      className={`text-sm font-semibold px-4 py-2 rounded-xl ${getStatusColor(
                        userDetails.role
                      )}`}
                    >
                      {userDetails.role === "STUDENT"
                        ? "🎓"
                        : userDetails.role === "INSTRUCTOR"
                        ? "👨‍🏫"
                        : "⚡"}{" "}
                      {userDetails.role}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Account Status
                    </Label>
                    <Badge
                      className={`text-sm font-semibold px-4 py-2 rounded-xl ${getStatusColor(
                        userDetails.status
                      )}`}
                    >
                      {userDetails.status === "ACTIVE"
                        ? "✅"
                        : userDetails.status === "INACTIVE"
                        ? "⏸️"
                        : "🚫"}{" "}
                      {userDetails.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Member Since
                    </Label>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-xl">
                      {new Date(userDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Last Login
                    </Label>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 p-3 rounded-xl">
                      {userDetails.lastLogin
                        ? new Date(userDetails.lastLogin).toLocaleDateString()
                        : "Never logged in"}
                    </p>
                  </div>
                </div>
                {userDetails.profile && (
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700">
                      Profile Information
                    </Label>
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Bio
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            {(typeof userDetails.profile === "object" &&
                              userDetails.profile.bio) ||
                              "No bio information available for this user."}
                          </p>
                        </div>
                        {typeof userDetails.profile === "object" &&
                          userDetails.profile.phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Phone
                              </p>
                              <p className="text-gray-700">
                                {userDetails.profile.phone}
                              </p>
                            </div>
                          )}
                        {typeof userDetails.profile === "object" &&
                          userDetails.profile.address && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Address
                              </p>
                              <p className="text-gray-700">
                                {userDetails.profile.address}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modern User Activity Modal */}
        <Dialog
          open={userActivity.length > 0}
          onOpenChange={() => setUserActivity([])}
        >
          <DialogContent className="max-w-5xl bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <span className="text-white text-3xl">📊</span>
              </div>
              <DialogTitle className="text-3xl font-bold text-gray-900">
                User Activity
              </DialogTitle>
              <p className="text-gray-600">
                Complete activity timeline and analytics
              </p>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userActivity.map((activity, index) => (
                <div
                  key={index}
                  className="group flex items-center space-x-6 p-6 bg-gradient-to-r from-white/80 to-gray-50/50 backdrop-blur-xl border border-gray-200/50 rounded-2xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-4 h-4 bg-brand-gradient rounded-full shadow-lg"></div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-brand-accent/10 text-brand-accent border-brand-accent/20 px-4 py-2 rounded-xl font-semibold">
                    {activity.type}
                  </Badge>
                </div>
              ))}
              {userActivity.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No activity found
                  </h3>
                  <p className="text-gray-600">
                    This user hasn&apos;t performed any actions yet
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
