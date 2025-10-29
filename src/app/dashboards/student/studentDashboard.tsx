"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StudentAssessments from "@/components/student-assessments";
import StudentProgressTracking from "@/components/student-progress-tracking";
import UserDropdown from "@/components/user-dropdown";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";
import { safeJsonParse } from "@/lib/api-utils";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import ApplicationWizard from "@/components/onboarding/ApplicationWizard";
import AchievementSystem from "@/components/gamification/AchievementSystem";
// import CourseRecommendations from "@/components/recommendations/CourseRecommendations";
import NotificationSystem from "@/components/mobile/NotificationSystem";
import PaymentDashboard from "@/components/student/payments/PaymentDashboard";
import StudentLayout from "@/components/student/layout/StudentLayout";
import StudentSettings from "@/components/student/settings/StudentSettings";
import StudentProfile from "@/components/student/profile/StudentProfile";
import PersonalizedOverview from "@/components/student/dashboard/PersonalizedOverview";
import CourseProgressVisualization from "@/components/student/dashboard/CourseProgressVisualization";
import DeadlinesAndReminders from "@/components/student/dashboard/DeadlinesAndReminders";
import AchievementProgressTracking from "@/components/student/dashboard/AchievementProgressTracking";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating: number;
  reviewCount: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  prerequisites: string[];
  learningOutcomes: string[];
  syllabus: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";
  duration: number;
  isCompleted: boolean;
  resources: Resource[];
}

interface Resource {
  id: string;
  name: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "AUDIO";
  url: string;
  downloadable: boolean;
}

interface Application {
  id: string;
  course: Course;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  payments: {
    applicationFee: PaymentInfo;
    tuition?: PaymentInfo;
  };
  documents: ApplicationDocument[];
}

interface PaymentInfo {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  method: "PAYSTACK" | "BANK_TRANSFER" | "INSTALLMENT";
  paidAt?: string;
  reference: string;
  receipt?: string;
}

interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Enrollment {
  id: string;
  course: Course;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED";
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  currentLesson?: string;
  timeSpent: number;
  certificates: Certificate[];
  grades: Grade[];
}

interface Certificate {
  id: string;
  type: "COMPLETION" | "ACHIEVEMENT";
  issuedAt: string;
  credentialId: string;
  downloadUrl: string;
}

interface Grade {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  grade: string;
  feedback?: string;
  submittedAt: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  totalAmount: number;
  installments: Installment[];
  isActive: boolean;
}

interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  paidAt?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  isFromSupport: boolean;
  createdAt: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [assessmentSubmissions, setAssessmentSubmissions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showApplicationWizard, setShowApplicationWizard] = useState(false);
  const [selectedCourseForApplication, setSelectedCourseForApplication] =
    useState<Course | null>(null);

  // Enhanced Dashboard States
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [learningStreak, setLearningStreak] = useState({
    current: 0,
    longest: 0,
    lastActivity: "",
  });
  const [learningStats, setLearningStats] = useState({
    totalHours: 0,
    coursesCompleted: 0,
    averageScore: 0,
    skillsLearned: [],
    weeklyGoal: {
      target: 10,
      current: 0,
      unit: "hours" as const,
    },
  });

  // Course Catalog States
  const [courseFilter, setCourseFilter] = useState({
    category: "ALL",
    difficulty: "ALL",
    priceRange: "ALL",
    search: "",
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  // Application States
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    courseId: "",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
    education: {
      highestDegree: "",
      institution: "",
      yearCompleted: "",
    },
    motivation: "",
    documents: [] as File[],
  });

  // Payment States
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("PAYSTACK");

  // Learning States
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [showLessonViewer, setShowLessonViewer] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Support States
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "MEDIUM" as const,
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
    fetchEnhancedDashboardData();
  }, []);

  useEffect(() => {
    // Check if user needs onboarding
    if (
      user &&
      user.learningProfile &&
      !user.learningProfile.onboardingCompleted
    ) {
      setShowOnboarding(true);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/user/profile");
      const result = await response.json();

      if (result.success) {
        setUser(result.user);
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
  };

  const fetchEnhancedDashboardData = async () => {
    try {
      // Mock data for enhanced dashboard features
      // In a real implementation, these would be API calls

      // Mock upcoming deadlines
      const mockDeadlines = [
        {
          id: "1",
          title: "Photography Assignment 1",
          description: "Submit your first photography portfolio",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          course: {
            id: "1",
            title: "Digital Photography Basics",
            color: "blue",
          },
          type: "assignment",
          priority: "high",
          status: "pending",
          estimatedTime: 120,
          reminderSet: false,
        },
        {
          id: "2",
          title: "Video Editing Quiz",
          description: "Complete the mid-term quiz on video editing techniques",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          course: { id: "2", title: "Video Production", color: "green" },
          type: "quiz",
          priority: "medium",
          status: "pending",
          estimatedTime: 45,
          reminderSet: true,
        },
      ];

      // Mock achievements
      const mockAchievements = [
        {
          id: "1",
          title: "First Steps",
          description: "Completed your first lesson",
          icon: "🎯",
          category: "learning",
          rarity: "common",
          earnedDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          points: 10,
        },
        {
          id: "2",
          title: "Week Warrior",
          description: "Maintained a 7-day learning streak",
          icon: "🔥",
          category: "engagement",
          rarity: "rare",
          earnedDate: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          points: 50,
        },
        {
          id: "3",
          title: "Course Conqueror",
          description: "Completed your first course",
          icon: "🏆",
          category: "milestone",
          rarity: "epic",
          earnedDate: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          points: 100,
        },
      ];

      // Mock learning stats
      const mockLearningStats = {
        totalHours: 24,
        coursesCompleted: 1,
        averageScore: 87,
        skillsLearned: ["Photography", "Video Editing", "Color Theory"],
        weeklyGoal: {
          target: 10,
          current: 6,
          unit: "hours" as const,
        },
      };

      // Mock learning streak
      const mockLearningStreak = {
        current: 5,
        longest: 12,
        lastActivity: "Today",
      };

      setUpcomingDeadlines(mockDeadlines);
      setAchievements(mockAchievements);
      setLearningStats(mockLearningStats);
      setLearningStreak(mockLearningStreak);
    } catch (error) {
      console.error("Error fetching enhanced dashboard data:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem("accessToken");
      console.log("Token from localStorage:", token ? "Found" : "Not found");

      if (!token) {
        console.log("No authentication token found, redirecting to login");
        router.push("/auth/login");
        return;
      }

      console.log("Token found, proceeding with API calls...");

      // Fetch all student data in parallel with Authorization header
      console.log(
        "Making API calls with token:",
        token.substring(0, 20) + "..."
      );
      const [
        coursesRes,
        applicationsRes,
        enrollmentsRes,
        paymentsRes,
        ticketsRes,
        assessmentsRes,
        notificationsRes,
        statsRes,
      ] = await Promise.all([
        fetch("/api/student/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/enrollments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/support-tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/assessments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/notifications/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/student/stats/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      // Check for 401 responses (unauthorized)
      if (
        coursesRes.status === 401 ||
        applicationsRes.status === 401 ||
        enrollmentsRes.status === 401 ||
        paymentsRes.status === 401 ||
        ticketsRes.status === 401 ||
        assessmentsRes.status === 401 ||
        notificationsRes.status === 401 ||
        statsRes.status === 401
      ) {
        console.log("Authentication failed, redirecting to login");
        router.push("/auth/login");
        return;
      }

      // Use the safe JSON parsing utility

      const [
        coursesData,
        applicationsData,
        enrollmentsData,
        paymentsData,
        ticketsData,
        assessmentsData,
        notificationsData,
        statsData,
      ] = await Promise.all([
        safeJsonParse(coursesRes, { success: false, data: { courses: [] } }),
        safeJsonParse(applicationsRes, {
          success: false,
          data: { applications: [] },
        }),
        safeJsonParse(enrollmentsRes, {
          success: false,
          data: { enrollments: [] },
        }),
        safeJsonParse(paymentsRes, { success: false, data: { payments: [] } }),
        safeJsonParse(ticketsRes, { success: false, data: { tickets: [] } }),
        safeJsonParse(assessmentsRes, { success: false, data: [] }),
        safeJsonParse(notificationsRes, {
          success: false,
          data: { notifications: [] },
        }),
        safeJsonParse(statsRes, { success: false, data: {} }),
      ]);

      // Ensure courses is always an array
      if (
        coursesData.success &&
        coursesData.data &&
        Array.isArray(coursesData.data.courses)
      ) {
        setCourses(coursesData.data.courses);
      } else {
        console.log(
          "Courses API failed or returned invalid data:",
          coursesData
        );
        setCourses([]);
      }

      if (
        applicationsData.success &&
        applicationsData.data &&
        Array.isArray(applicationsData.data.applications)
      ) {
        setApplications(applicationsData.data.applications);
      } else {
        console.log(
          "Applications API failed or returned invalid data:",
          applicationsData
        );
        setApplications([]);
      }

      if (
        enrollmentsData.success &&
        enrollmentsData.data &&
        Array.isArray(enrollmentsData.data.enrollments)
      ) {
        setEnrollments(enrollmentsData.data.enrollments);
      } else {
        console.log(
          "Enrollments API failed or returned invalid data:",
          enrollmentsData
        );
        setEnrollments([]);
      }

      if (
        paymentsData.success &&
        paymentsData.data &&
        Array.isArray(paymentsData.data.payments)
      ) {
        setPaymentPlans(paymentsData.data.payments);
      } else {
        setPaymentPlans([]);
      }

      if (
        ticketsData.success &&
        ticketsData.data &&
        Array.isArray(ticketsData.data.tickets)
      ) {
        setSupportTickets(ticketsData.data.tickets);
      } else {
        setSupportTickets([]);
      }

      // Process assessments data
      if (
        assessmentsData.success &&
        assessmentsData.data &&
        Array.isArray(assessmentsData.data)
      ) {
        setAssessments(assessmentsData.data);
      } else {
        console.log(
          "Assessments API failed or returned invalid data:",
          assessmentsData
        );
        setAssessments([]);
      }

      // Process notifications data
      if (
        notificationsData.success &&
        notificationsData.data &&
        notificationsData.data.notifications &&
        Array.isArray(notificationsData.data.notifications)
      ) {
        // Update notifications state - you might need to add this state variable
        console.log(
          "Notifications loaded:",
          notificationsData.data.notifications.length
        );
        // setNotifications(notificationsData.data.notifications);
      } else {
        console.log(
          "Notifications API failed or returned invalid data:",
          notificationsData
        );
        // setNotifications([]);
      }

      // Process stats data
      if (statsData.success && statsData.data) {
        console.log("Stats loaded:", statsData.data);
        // You can use this data for dashboard statistics
        // setStats(statsData.data);
      } else {
        console.log("Stats API failed or returned invalid data:", statsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Ensure all states are arrays on error
      setCourses([]);
      setApplications([]);
      setEnrollments([]);
      setPaymentPlans([]);
      setSupportTickets([]);
      setAssessments([]);
      setAssessmentSubmissions([]);
      // setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Application Management Functions
  const handleApplyForCourse = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourseForApplication(course);
      setShowApplicationWizard(true);
    }
  };

  const handleOnboardingComplete = (profile: any) => {
    setShowOnboarding(false);
    setUser((prev) => ({
      ...prev,
      learningProfile: {
        ...prev.learningProfile,
        ...profile,
        onboardingCompleted: true,
      },
    }));
    // Refresh dashboard data to get personalized recommendations
    fetchDashboardData();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setUser((prev) => ({
      ...prev,
      learningProfile: {
        ...prev.learningProfile,
        onboardingCompleted: true,
      },
    }));
  };

  const handleApplicationComplete = (applicationData: any) => {
    setShowApplicationWizard(false);
    setSelectedCourseForApplication(null);
    // Refresh applications
    fetchDashboardData();
  };

  const handleApplicationCancel = () => {
    setShowApplicationWizard(false);
    setSelectedCourseForApplication(null);
  };

  const handleSubmitApplication = async () => {
    try {
      const formData = new FormData();
      formData.append("applicationData", JSON.stringify(applicationData));
      applicationData.documents.forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });

      const response = await fetch("/api/student/applications", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setApplications([result.data, ...applications]);
        setShowApplicationForm(false);
        alert("Application submitted successfully!");
      } else {
        alert(result.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("An error occurred while submitting your application");
    }
  };

  // Payment Management Functions
  const handleInitializePayment = async (
    type: string,
    amount: number,
    courseId?: string
  ) => {
    try {
      const response = await fetch("/api/student/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          courseId,
          paymentMethod,
          paymentPlan: selectedPaymentPlan,
        }),
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = result.data.authorizationUrl;
      } else {
        alert(result.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      alert("An error occurred while processing payment");
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await fetch(
        `/api/student/payments/${paymentId}/receipt`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${paymentId}.pdf`;
      a.click();
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  // Learning Experience Functions
  const handleStartLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setShowLessonViewer(true);
  };

  const handleBookmarkLesson = (lessonId: string) => {
    setBookmarks((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleDownloadResource = async (resource: Resource) => {
    if (!resource.downloadable) return;
    try {
      const response = await fetch(resource.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.name;
      a.click();
    } catch (error) {
      console.error("Error downloading resource:", error);
    }
  };

  // Support Functions
  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/student/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });

      const result = await response.json();
      if (result.success) {
        setSupportTickets([result.data, ...supportTickets]);
        setShowSupportForm(false);
        setNewTicket({ subject: "", message: "", priority: "MEDIUM" });
      } else {
        alert(result.message || "Failed to create support ticket");
      }
    } catch (error) {
      console.error("Error creating support ticket:", error);
    }
  };

  // Assessment Functions
  const handleTakeAssessment = async (assessmentId: string) => {
    try {
      // Navigate to assessment page or open assessment modal
      console.log("Taking assessment:", assessmentId);
      // Implementation for taking assessment
    } catch (error) {
      console.error("Error taking assessment:", error);
      alert("Failed to start assessment");
    }
  };

  const handleViewSubmission = async (submissionId: string) => {
    try {
      // Navigate to submission details or open modal
      console.log("Viewing submission:", submissionId);
      // Implementation for viewing submission details
    } catch (error) {
      console.error("Error viewing submission:", error);
      alert("Failed to load submission details");
    }
  };

  // User Profile Functions
  const handleUpdateProfile = async (data: any) => {
    try {
      const response = await makeAuthenticatedRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
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

  const handleUpdatePassword = async (data: any) => {
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

  // Enhanced Dashboard Handlers
  const handleContinueCourse = (courseId: string) => {
    console.log("Continue course:", courseId);
    // Navigate to course content or open course modal
    setActiveTab("learning");
  };

  const handleViewDeadlines = () => {
    setActiveTab("deadlines");
  };

  const handleViewAchievements = () => {
    setActiveTab("achievements");
  };

  const handleSetReminder = (deadlineId: string) => {
    console.log("Set reminder for deadline:", deadlineId);
    // Implement reminder setting logic
    setUpcomingDeadlines((prev) =>
      prev.map((deadline) =>
        deadline.id === deadlineId
          ? { ...deadline, reminderSet: true }
          : deadline
      )
    );
  };

  const handleViewDeadline = (deadlineId: string) => {
    console.log("View deadline:", deadlineId);
    // Navigate to deadline details or open modal
  };

  const handleAddReminder = () => {
    console.log("Add custom reminder");
    // Open add reminder modal
  };

  const handleViewAchievement = (achievementId: string) => {
    console.log("View achievement:", achievementId);
    // Open achievement details modal
  };

  const handleSetGoal = () => {
    console.log("Set learning goal");
    // Open goal setting modal
  };

  const handleViewCourse = (courseId: string) => {
    console.log("View course:", courseId);
    // Navigate to course details
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      UNDER_REVIEW: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      ACTIVE: "bg-green-100 text-green-800",
      COMPLETED: "bg-purple-100 text-purple-800",
      SUSPENDED: "bg-red-100 text-red-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      OVERDUE: "bg-orange-100 text-orange-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      BEGINNER: "bg-green-100 text-green-800",
      INTERMEDIATE: "bg-yellow-100 text-yellow-800",
      ADVANCED: "bg-red-100 text-red-800",
    };
    return (
      colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(courseFilter.search.toLowerCase()) ||
      course.description
        .toLowerCase()
        .includes(courseFilter.search.toLowerCase());
    const matchesCategory =
      courseFilter.category === "ALL" ||
      course.category === courseFilter.category;
    const matchesDifficulty =
      courseFilter.difficulty === "ALL" ||
      course.difficulty === courseFilter.difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Loading Your Dashboard
            </h2>
            <p className="text-gray-600">
              Preparing your personalized learning experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-7xl mx-auto">
        {/* Modern Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Applications Card */}
          <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Applications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Array.isArray(applications) ? applications.length : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Course applications submitted
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">📄</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollments Card */}
          <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Active Courses
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Array.isArray(enrollments) ? enrollments.length : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently enrolled
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">🎓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Courses Card */}
          <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Available Courses
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Array.isArray(courses) ? courses.length : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ready to enroll</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">📚</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Average Progress
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Array.isArray(enrollments) && enrollments.length > 0
                      ? Math.round(
                          enrollments.reduce(
                            (acc, e) => acc + (e.progress || 0),
                            0
                          ) / enrollments.length
                        )
                      : 0}
                    <span className="text-lg text-gray-500">%</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Overall completion
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && user && (
            <StudentProfile userId={user.id} user={user} />
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && user && (
            <PersonalizedOverview
              user={user}
              enrollments={enrollments}
              upcomingDeadlines={upcomingDeadlines}
              recentActivity={recentActivity}
              achievements={achievements}
              onContinueCourse={handleContinueCourse}
              onViewDeadlines={handleViewDeadlines}
              onViewAchievements={handleViewAchievements}
            />
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <Card className="shadow-xl border-0 card-brand-subtle">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 icon-brand-primary rounded-lg flex items-center justify-center primary-glow">
                    <span className="text-white text-lg">🎯</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">
                      Course Catalog
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Discover and apply for amazing courses to advance your
                      skills
                    </CardDescription>
                  </div>
                </div>

                {/* Course Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <Input
                    placeholder="Search courses..."
                    value={courseFilter.search}
                    onChange={(e) =>
                      setCourseFilter({
                        ...courseFilter,
                        search: e.target.value,
                      })
                    }
                    className="max-w-xs"
                  />
                  <Select
                    value={courseFilter.category}
                    onValueChange={(value: string) =>
                      setCourseFilter({ ...courseFilter, category: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
                      <SelectItem value="VIDEOGRAPHY">Videography</SelectItem>
                      <SelectItem value="EDITING">Editing</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={courseFilter.difficulty}
                    onValueChange={(value: string) =>
                      setCourseFilter({ ...courseFilter, difficulty: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Levels</SelectItem>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!Array.isArray(courses) || courses.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📚</span>
                      </div>
                      <p className="text-gray-500 font-medium text-lg">
                        No courses available at the moment
                      </p>
                      <p className="text-sm text-gray-400">
                        Check back soon for new courses!
                      </p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                  {course.category}
                                </span>
                              </div>
                              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {course.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-500">👨‍🏫</span>
                              <span className="text-gray-600">
                                {course.instructor.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-500">⏱️</span>
                              <span className="text-gray-600">
                                {course.duration} weeks
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-purple-500">🎓</span>
                              <span className="text-gray-600">
                                {course.mode.join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-500">💰</span>
                              <span className="text-gray-600">
                                ₵{course.price.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {course.applicationFee > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">
                                  Application Fee:
                                </span>{" "}
                                ₵{course.applicationFee.toLocaleString()}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Link
                              href={`/courses/${course.id}`}
                              className="flex-1"
                            >
                              <Button
                                variant="outline"
                                className="w-full py-3 rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                              >
                                📖 View Details
                              </Button>
                            </Link>
                            <Button
                              onClick={() => handleApplyForCourse(course.id)}
                              className="flex-1 btn-brand-professional font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                            >
                              🚀 Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Tab */}
          {/* {activeTab === "recommendations" && user && (
            <CourseRecommendations
              userId={user.id}
              userProfile={user.learningProfile}
            />
          )} */}

          {/* Assessments Tab */}
          {activeTab === "assessments" && (
            <StudentAssessments
              assessments={assessments}
              submissions={assessmentSubmissions}
              onTakeAssessment={handleTakeAssessment}
              onViewSubmission={handleViewSubmission}
            />
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && user && (
            <PaymentDashboard userId={user.id} />
          )}

          {/* Learning Tab */}
          {activeTab === "learning" && (
            <CourseProgressVisualization
              enrollments={enrollments}
              onContinueCourse={handleContinueCourse}
              onViewCourse={handleViewCourse}
            />
          )}

          {/* Deadlines Tab */}
          {activeTab === "deadlines" && (
            <DeadlinesAndReminders
              deadlines={upcomingDeadlines}
              onSetReminder={handleSetReminder}
              onViewDeadline={handleViewDeadline}
              onAddReminder={handleAddReminder}
            />
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && user && (
            <AchievementProgressTracking
              achievements={achievements}
              learningStreak={learningStreak}
              learningStats={learningStats}
              onViewAchievement={handleViewAchievement}
              onSetGoal={handleSetGoal}
            />
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && user && (
            <NotificationSystem userId={user.id} />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && user && (
            <StudentSettings userId={user.id} user={user} />
          )}
        </div>
      </div>

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Application Wizard */}
      {showApplicationWizard && selectedCourseForApplication && (
        <ApplicationWizard
          courseId={selectedCourseForApplication.id}
          courseTitle={selectedCourseForApplication.title}
          onComplete={handleApplicationComplete}
          onCancel={handleApplicationCancel}
        />
      )}
    </StudentLayout>
  );
}
