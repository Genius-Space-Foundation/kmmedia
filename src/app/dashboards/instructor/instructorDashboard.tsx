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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import CourseCreationWizard from "@/components/course-creation-wizard";
import AssessmentManagement from "@/components/assessment-management";
import AnnouncementManagement from "@/components/announcement-management";
import UserDropdown from "@/components/user-dropdown";
import { makeAuthenticatedRequest, clearAuthTokens } from "@/lib/token-utils";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  prerequisites: string[];
  learningObjectives: string[];
  _count: {
    applications: number;
    enrollments: number;
    lessons: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE_SESSION";
  content: string;
  duration: number;
  order: number;
  isPublished: boolean;
  resources: Resource[];
}

interface Resource {
  id: string;
  name: string;
  type: "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "DOCUMENT";
  url: string;
  size: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastActivity: string;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED";
  attendance: AttendanceRecord[];
}

interface AttendanceRecord {
  id: string;
  lessonId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  duration: number;
}

interface Assessment {
  id: string;
  title: string;
  type: "QUIZ" | "ASSIGNMENT" | "EXAM";
  courseId: string;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  attempts: number;
  isPublished: boolean;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "SHORT_ANSWER";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  isScheduled: boolean;
  scheduledFor?: string;
  createdAt: string;
  recipients: string[];
}

interface NewCourseData {
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  mode: string[];
  applicationFee: number;
  prerequisites: string[];
  learningObjectives: string[];
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Course Management States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState<NewCourseData>({
    title: "",
    description: "",
    category: "",
    duration: 0,
    price: 0,
    mode: ["ONLINE"],
    applicationFee: 0,
    prerequisites: [],
    learningObjectives: [],
  });

  // Advanced Course Creation States
  const [courseCreationStep, setCourseCreationStep] = useState(1);
  const [courseWizardData, setCourseWizardData] = useState({
    basicInfo: {
      title: "",
      description: "",
      category: "",
      difficulty: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      language: "English",
      tags: [] as string[],
    },
    pricing: {
      price: 0,
      applicationFee: 0,
      installmentPlans: [] as any[],
    },
    content: {
      prerequisites: [] as string[],
      learningObjectives: [] as string[],
      curriculum: [] as any[],
    },
    media: {
      thumbnail: "",
      videoIntro: "",
      gallery: [] as string[],
    },
  });
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");

  // Content Management States
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    type: "VIDEO" as const,
    content: "",
    duration: 0,
  });

  // Student Management States
  const [studentFilter, setStudentFilter] = useState({
    status: "ALL",
    search: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Assessment States
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    type: "QUIZ" as const,
    totalPoints: 100,
    passingScore: 70,
    timeLimit: 60,
  });

  // Communication States
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    courseId: "",
    isScheduled: false,
    scheduledFor: "",
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
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
  };

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, studentsRes, assessmentsRes, announcementsRes] =
        await Promise.all([
          fetch("/api/instructor/courses"),
          fetch("/api/instructor/students"),
          fetch("/api/instructor/assessments"),
          fetch("/api/instructor/announcements"),
        ]);

      const [coursesData, studentsData, assessmentsData, announcementsData] =
        await Promise.all([
          coursesRes.json().catch(() => ({ success: false, data: [] })),
          studentsRes.json().catch(() => ({ success: false, data: [] })),
          assessmentsRes.json().catch(() => ({ success: false, data: [] })),
          announcementsRes.json().catch(() => ({ success: false, data: [] })),
        ]);

      if (coursesData.success) setCourses(coursesData.data);
      if (studentsData.success) setStudents(studentsData.data);
      if (assessmentsData.success) setAssessments(assessmentsData.data);
      if (announcementsData.success) setAnnouncements(announcementsData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Course Management Functions
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      const result = await response.json();
      if (result.success) {
        setCourses([result.data, ...courses]);
        setShowCreateForm(false);
        setNewCourse({
          title: "",
          description: "",
          category: "",
          duration: 0,
          price: 0,
          mode: ["ONLINE"],
          applicationFee: 0,
          prerequisites: [],
          learningObjectives: [],
        });
      } else {
        alert(result.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("An error occurred while creating the course");
    }
  };

  // Advanced Course Creation Functions
  const handleCourseWizardNext = () => {
    if (courseCreationStep < 4) {
      setCourseCreationStep(courseCreationStep + 1);
    }
  };

  const handleCourseWizardPrev = () => {
    if (courseCreationStep > 1) {
      setCourseCreationStep(courseCreationStep - 1);
    }
  };

  const handleCourseWizardSubmit = async () => {
    try {
      const courseData = {
        ...courseWizardData.basicInfo,
        ...courseWizardData.pricing,
        prerequisites: courseWizardData.content.prerequisites,
        learningObjectives: courseWizardData.content.learningObjectives,
        curriculum: courseWizardData.content.curriculum,
        thumbnail: courseWizardData.media.thumbnail,
        videoIntro: courseWizardData.media.videoIntro,
        gallery: courseWizardData.media.gallery,
      };

      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();
      if (result.success) {
        setCourses([result.data, ...courses]);
        setShowCreateForm(false);
        setCourseCreationStep(1);
        setCourseWizardData({
          basicInfo: {
            title: "",
            description: "",
            category: "",
            difficulty: "BEGINNER",
            language: "English",
            tags: [],
          },
          pricing: {
            price: 0,
            applicationFee: 0,
            installmentPlans: [],
          },
          content: {
            prerequisites: [],
            learningObjectives: [],
            curriculum: [],
          },
          media: {
            thumbnail: "",
            videoIntro: "",
            gallery: [],
          },
        });
        alert("Course created successfully!");
      } else {
        alert(result.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("An error occurred while creating the course");
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourseWizardData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          prerequisites: [
            ...prev.content.prerequisites,
            newPrerequisite.trim(),
          ],
        },
      }));
      setNewPrerequisite("");
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setCourseWizardData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          learningObjectives: [
            ...prev.content.learningObjectives,
            newObjective.trim(),
          ],
        },
      }));
      setNewObjective("");
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setCourseWizardData((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          tags: [...prev.basicInfo.tags, newTag.trim()],
        },
      }));
      setNewTag("");
    }
  };

  const removePrerequisite = (index: number) => {
    setCourseWizardData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        prerequisites: prev.content.prerequisites.filter((_, i) => i !== index),
      },
    }));
  };

  const removeObjective = (index: number) => {
    setCourseWizardData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        learningObjectives: prev.content.learningObjectives.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const removeTag = (index: number) => {
    setCourseWizardData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        tags: prev.basicInfo.tags.filter((_, i) => i !== index),
      },
    }));
  };

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/duplicate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (result.success) {
        setCourses([result.data, ...courses]);
      } else {
        alert(result.message || "Failed to duplicate course");
      }
    } catch (error) {
      console.error("Error duplicating course:", error);
    }
  };

  const handleAutoSave = async (courseId: string, data: Partial<Course>) => {
    try {
      await fetch(`/api/instructor/courses/${courseId}/autosave`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  // Content Management Functions
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const response = await fetch(
        `/api/instructor/courses/${selectedCourse}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLesson),
        }
      );
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
        setShowLessonForm(false);
        setNewLesson({
          title: "",
          description: "",
          type: "VIDEO",
          content: "",
          duration: 0,
        });
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleUploadResource = async (lessonId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);

      const response = await fetch("/api/instructor/resources/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
    }
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      PENDING_APPROVAL: "bg-blue-100 text-blue-800",
      APPROVED: "bg-green-100 text-green-800",
      PUBLISHED: "bg-purple-100 text-purple-800",
      REJECTED: "bg-red-100 text-red-800",
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleSubmitForApproval = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "PENDING_APPROVAL" }),
      });

      const result = await response.json();

      if (result.success) {
        fetchCourses(); // Refresh courses
      } else {
        alert(result.message || "Failed to submit course for approval");
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      alert("An error occurred while submitting the course");
    }
  };

  // Assessment Management Functions
  const handleCreateAssessment = async (data: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("/api/instructor/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to create assessment");
      }
    } catch (error) {
      console.error("Assessment creation error:", error);
      setError("Failed to create assessment");
    }
  };

  const handleUpdateAssessment = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`/api/instructor/assessments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to update assessment");
      }
    } catch (error) {
      console.error("Assessment update error:", error);
      setError("Failed to update assessment");
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`/api/instructor/assessments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Assessment deletion error:", error);
      setError("Failed to delete assessment");
    }
  };

  const handleGradeSubmission = async (submissionId: string, data: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `/api/instructor/assessments/submissions/${submissionId}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to grade submission");
      }
    } catch (error) {
      console.error("Assessment grading error:", error);
      setError("Failed to grade submission");
    }
  };

  // Announcement Management Functions
  const handleCreateAnnouncement = async (data: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("/api/instructor/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Announcement creation error:", error);
      setError("Failed to create announcement");
    }
  };

  const handleUpdateAnnouncement = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`/api/instructor/announcements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to update announcement");
      }
    } catch (error) {
      console.error("Announcement update error:", error);
      setError("Failed to update announcement");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`/api/instructor/announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to delete announcement");
      }
    } catch (error) {
      console.error("Announcement deletion error:", error);
      setError("Failed to delete announcement");
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `/api/instructor/announcements/${id}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchDashboardData();
      } else {
        setError(result.message || "Failed to publish announcement");
      }
    } catch (error) {
      console.error("Announcement publishing error:", error);
      setError("Failed to publish announcement");
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
              Loading Instructor Dashboard
            </h2>
            <p className="text-gray-600">Preparing your teaching tools</p>
          </div>
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-2xl">👨‍🏫</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">I</span>
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-brand-gradient tracking-tight">
                  Instructor Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Create, manage, and deliver exceptional learning experiences
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"></div>
                  <span>Live Teaching Status</span>
                </div>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 bg-white/80 hover:bg-brand-gradient hover:text-white border-brand-primary/20 hover:border-transparent transition-all duration-300 rounded-xl"
                >
                  🔔
                </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 card-brand-modern hover:scale-105 animate-fade-in-up">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">📚</span>
                </div>
                <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                  My Courses
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {courses.length}
                </div>
                <div className="text-xs text-brand-primary font-medium">
                  Active courses
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="group hover:shadow-2xl transition-all duration-300 border-0 card-brand-modern hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">🎓</span>
                </div>
                <div className="w-3 h-3 bg-brand-secondary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                  Students
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {students.length}
                </div>
                <div className="text-xs text-brand-secondary font-medium">
                  Enrolled learners
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="group hover:shadow-2xl transition-all duration-300 border-0 card-brand-modern hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                  Assessments
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {assessments.length}
                </div>
                <div className="text-xs text-brand-accent font-medium">
                  Active evaluations
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="group hover:shadow-2xl transition-all duration-300 border-0 card-brand-modern hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white text-lg">📢</span>
                </div>
                <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3">
                <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                  Announcements
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  {announcements.length}
                </div>
                <div className="text-xs text-brand-primary font-medium">
                  Published updates
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Create Course Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CourseCreationWizard
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCourseWizardSubmit}
              />
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        {!showCreateForm && (
          <div className="fixed bottom-8 right-8 z-40">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-14 h-14 bg-brand-gradient hover:shadow-2xl hover:scale-110 transition-all duration-300 rounded-2xl shadow-xl"
            >
              <span className="text-2xl">➕</span>
            </Button>
          </div>
        )}

        {!showCreateForm && (
          <Tabs defaultValue="courses" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/20">
              <TabsList className="grid w-full grid-cols-10 bg-transparent h-14">
                <TabsTrigger
                  value="courses"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📚 Courses
                </TabsTrigger>
                <TabsTrigger
                  value="lessons"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📖 Lessons
                </TabsTrigger>
                <TabsTrigger
                  value="assessments"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📝 Assessments
                </TabsTrigger>
                <TabsTrigger
                  value="gradebook"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📊 Gradebook
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  🎓 Students
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📅 Calendar
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  💬 Messages
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📁 Files
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📈 Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="announcements"
                  className="data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
                >
                  📢 Announcements
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="courses" className="space-y-6">
              <Card className="mb-8 card-brand-modern">
                <CardHeader className="card-header-blue">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">➕</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Create New Course
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Fill in the details to create a new course
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCreateCourse} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="form-label-modern">
                          Course Title
                        </Label>
                        <Input
                          id="title"
                          className="form-input-modern"
                          value={newCourse.title}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              title: e.target.value,
                            })
                          }
                          required
                          placeholder="Enter course title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="form-label-modern">
                          Category
                        </Label>
                        <Input
                          id="category"
                          className="form-input-modern"
                          value={newCourse.category}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              category: e.target.value,
                            })
                          }
                          required
                          placeholder="Enter course category"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="form-label-modern"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        className="form-input-modern min-h-[120px] resize-none"
                        value={newCourse.description}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            description: e.target.value,
                          })
                        }
                        required
                        placeholder="Describe your course content and objectives"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="form-label-modern">
                          Duration (weeks)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          className="form-input-modern"
                          value={newCourse.duration}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              duration: parseInt(e.target.value),
                            })
                          }
                          required
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="form-label-modern">
                          Price (GH₵)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          className="form-input-modern"
                          value={newCourse.price}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              price: parseFloat(e.target.value),
                            })
                          }
                          required
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="applicationFee"
                          className="form-label-modern"
                        >
                          Application Fee (GH₵)
                        </Label>
                        <Input
                          id="applicationFee"
                          type="number"
                          className="form-input-modern"
                          value={newCourse.applicationFee}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              applicationFee: parseFloat(e.target.value),
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        className="btn-modern-primary px-8 py-3"
                      >
                        Create Course
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="px-8 py-3 border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary transition-all duration-300"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Courses List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Your Courses
                  </h2>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-modern-primary"
                  >
                    <span className="mr-2">➕</span>
                    Create New Course
                  </Button>
                </div>

                {courses.length === 0 ? (
                  <Card className="card-brand-modern">
                    <CardContent className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📚</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No courses created yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Start building your teaching portfolio by creating your
                        first course
                      </p>
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-modern-primary px-8 py-3"
                      >
                        Create Your First Course
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                      <Card
                        key={course.id}
                        className="group card-brand-modern hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {course.title}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-600">
                                {course.category}
                              </CardDescription>
                            </div>
                            <div className="ml-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  course.status === "DRAFT"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : course.status === "PENDING_APPROVAL"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : course.status === "APPROVED"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {course.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <p className="text-gray-500 font-medium">
                                Duration
                              </p>
                              <p className="text-gray-900 font-semibold">
                                {course.duration} weeks
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-gray-500 font-medium">Price</p>
                              <p className="text-gray-900 font-semibold">
                                GH₵{course.price.toLocaleString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-gray-500 font-medium">
                                Applications
                              </p>
                              <p className="text-gray-900 font-semibold">
                                {course._count.applications}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-gray-500 font-medium">
                                Enrollments
                              </p>
                              <p className="text-gray-900 font-semibold">
                                {course._count.enrollments}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-4 border-t border-gray-100">
                            {course.status === "DRAFT" && (
                              <Button
                                size="sm"
                                className="btn-modern-primary flex-1"
                                onClick={() =>
                                  handleSubmitForApproval(course.id)
                                }
                              >
                                Submit for Approval
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary transition-all duration-300"
                            >
                              Edit Course
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6">
              {/* Lesson Management Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Lesson Management
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Create, organize, and manage course content
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📁</span>
                    Upload Files
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">➕</span>
                    Create Lesson
                  </Button>
                </div>
              </div>

              {/* Lesson Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📖</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Lessons
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {courses.reduce(
                          (acc, course) => acc + course._count.lessons,
                          0
                        )}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        All courses
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">✅</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Published
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {courses.reduce(
                          (acc, course) =>
                            acc +
                            course.lessons.filter((l) => l.isPublished).length,
                          0
                        )}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Live content
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">⏱️</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Duration
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(
                          courses.reduce(
                            (acc, course) =>
                              acc +
                              course.lessons.reduce(
                                (lessonAcc, lesson) =>
                                  lessonAcc + lesson.duration,
                                0
                              ),
                            0
                          ) / 60
                        )}
                        h
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        Content hours
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Resources
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {courses.reduce(
                          (acc, course) =>
                            acc +
                            course.lessons.reduce(
                              (lessonAcc, lesson) =>
                                lessonAcc + lesson.resources.length,
                              0
                            ),
                          0
                        )}
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        Files uploaded
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Course Selection for Lessons */}
              <Card className="card-brand-modern">
                <CardHeader>
                  <CardTitle>Select Course to Manage Lessons</CardTitle>
                  <CardDescription>
                    Choose a course to view and manage its lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📚</span>
                      </div>
                      <p className="text-gray-500 mb-4">No courses available</p>
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-modern-primary"
                      >
                        Create Your First Course
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <Card
                          key={course.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                            selectedCourse === course.id
                              ? "ring-2 ring-brand-primary bg-brand-primary/5"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            setSelectedCourse(
                              selectedCourse === course.id ? null : course.id
                            )
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  📖
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {course._count.lessons} lessons
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lessons for Selected Course */}
              {selectedCourse && (
                <Card className="card-brand-modern">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Lessons for{" "}
                          {courses.find((c) => c.id === selectedCourse)?.title}
                        </CardTitle>
                        <CardDescription>
                          Manage lesson content, resources, and publishing
                        </CardDescription>
                      </div>
                      <Button className="btn-modern-primary">
                        <span className="mr-2">➕</span>
                        Add Lesson
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courses.find((c) => c.id === selectedCourse)?.lessons
                      .length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <span className="text-4xl">📖</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No Lessons Yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Start building your course content by adding lessons
                        </p>
                        <Button className="btn-modern-primary">
                          Create First Lesson
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courses
                          .find((c) => c.id === selectedCourse)
                          ?.lessons.map((lesson, index) => (
                            <Card
                              key={lesson.id}
                              className="hover:shadow-lg transition-all duration-300"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                      <span className="text-white font-semibold">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {lesson.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                        {lesson.description}
                                      </p>
                                      <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-xs text-gray-500">
                                          {lesson.type.replace("_", " ")}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {lesson.duration} min
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {lesson.resources.length} resources
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        lesson.isPublished
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      }`}
                                    >
                                      {lesson.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </span>

                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                                      >
                                        <span className="mr-1">✏️</span>
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                                      >
                                        <span className="mr-1">👁️</span>
                                        Preview
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="assessments" className="space-y-6">
              <AssessmentManagement
                assessments={assessments}
                onCreateAssessment={handleCreateAssessment}
                onUpdateAssessment={handleUpdateAssessment}
                onDeleteAssessment={handleDeleteAssessment}
                onGradeSubmission={handleGradeSubmission}
              />
            </TabsContent>

            <TabsContent value="gradebook" className="space-y-6">
              {/* Gradebook Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Gradebook
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Track student performance, grades, and academic progress
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📊</span>
                    Export Grades
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">📝</span>
                    Add Grade
                  </Button>
                </div>
              </div>

              {/* Gradebook Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Assignments
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {assessments.length}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        Active assessments
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">✅</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Graded
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        87%
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Completion rate
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">⭐</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Average Grade
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">B+</div>
                      <div className="text-xs text-purple-600 font-medium">
                        87.5% average
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">⏰</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Pending
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">12</div>
                      <div className="text-xs text-amber-600 font-medium">
                        Awaiting grading
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Course Selection for Gradebook */}
              <Card className="card-brand-modern">
                <CardHeader>
                  <CardTitle>Select Course to View Grades</CardTitle>
                  <CardDescription>
                    Choose a course to view and manage student grades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📚</span>
                      </div>
                      <p className="text-gray-500 mb-4">No courses available</p>
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-modern-primary"
                      >
                        Create Your First Course
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <Card
                          key={course.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                            selectedCourse === course.id
                              ? "ring-2 ring-brand-primary bg-brand-primary/5"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            setSelectedCourse(
                              selectedCourse === course.id ? null : course.id
                            )
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  📊
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {course._count.enrollments} students
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gradebook for Selected Course */}
              {selectedCourse && (
                <Card className="card-brand-modern">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Gradebook -{" "}
                          {courses.find((c) => c.id === selectedCourse)?.title}
                        </CardTitle>
                        <CardDescription>
                          View and manage student grades for this course
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                        >
                          <span className="mr-2">📊</span>
                          Grade Distribution
                        </Button>
                        <Button className="btn-modern-primary">
                          <span className="mr-2">📝</span>
                          Add Grade
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Student
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Quiz 1
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Assignment 1
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Midterm
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Final
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Average
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Grade
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.slice(0, 5).map((student, index) => (
                            <tr
                              key={student.id}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {student.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {student.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    85
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    /100
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    92
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    /100
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    78
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    /100
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    -
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    /100
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-gray-900">
                                  85%
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                  B+
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                                  >
                                    <span className="mr-1">✏️</span>
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                                  >
                                    <span className="mr-1">👁️</span>
                                    View
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grade Distribution Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>
                      Overview of student performance across all assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          A (90-100%)
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: "25%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">25%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          B (80-89%)
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "40%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">40%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          C (70-79%)
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-600 h-2 rounded-full"
                              style={{ width: "25%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">25%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          D (60-69%)
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: "8%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">8%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          F (Below 60%)
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: "2%" }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">2%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Assessment Performance</CardTitle>
                    <CardDescription>
                      Average scores by assessment type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📝</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            Quizzes
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">87%</div>
                          <div className="text-xs text-gray-500">Average</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📄</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            Assignments
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">92%</div>
                          <div className="text-xs text-gray-500">Average</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📊</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            Exams
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">78%</div>
                          <div className="text-xs text-gray-500">Average</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              {/* Student Management Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Student Management
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Track progress, manage attendance, and communicate with
                    students
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📊</span>
                    Export Report
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">💬</span>
                    Send Message
                  </Button>
                </div>
              </div>

              {/* Student Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">👥</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Students
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {students.length}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        Active learners
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">✅</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Active Students
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {students.filter((s) => s.status === "ACTIVE").length}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Currently enrolled
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">🎓</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Completed
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {
                          students.filter((s) => s.status === "COMPLETED")
                            .length
                        }
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        Graduated
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📈</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Avg Progress
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {students.length > 0
                          ? Math.round(
                              students.reduce((acc, s) => acc + s.progress, 0) /
                                students.length
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        Overall progress
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Student Filters and Search */}
              <Card className="card-brand-modern">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search students by name or email..."
                        className="form-input-modern"
                        value={studentFilter.search}
                        onChange={(e) =>
                          setStudentFilter({
                            ...studentFilter,
                            search: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Select
                      value={studentFilter.status}
                      onValueChange={(value) =>
                        setStudentFilter({ ...studentFilter, status: value })
                      }
                    >
                      <SelectTrigger className="w-48 form-input-modern">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Students</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="px-6">
                      <span className="mr-2">🔍</span>
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Students List */}
              <div className="space-y-4">
                {students.length === 0 ? (
                  <Card className="card-brand-modern">
                    <CardContent className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">👥</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No Students Yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Students will appear here once they enroll in your
                        courses
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  students.map((student, index) => (
                    <Card
                      key={student.id}
                      className="card-brand-modern hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {student.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {student.email}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  Enrolled:{" "}
                                  {new Date(
                                    student.enrolledAt
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Last Activity:{" "}
                                  {new Date(
                                    student.lastActivity
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {student.progress}%
                              </div>
                              <div className="text-xs text-gray-500">
                                Progress
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  student.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : student.status === "INACTIVE"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {student.status}
                              </span>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                              >
                                <span className="mr-1">📊</span>
                                Progress
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                              >
                                <span className="mr-1">💬</span>
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Course Progress</span>
                            <span>{student.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Calendar & Scheduling
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Schedule live sessions, set deadlines, and manage your
                    teaching calendar
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📅</span>
                    View Month
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">➕</span>
                    Schedule Event
                  </Button>
                </div>
              </div>

              {/* Calendar Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📅</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        This Week
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">8</div>
                      <div className="text-xs text-blue-600 font-medium">
                        Scheduled events
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">🎥</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Live Sessions
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-xs text-green-600 font-medium">
                        This week
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">⏰</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Deadlines
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">5</div>
                      <div className="text-xs text-purple-600 font-medium">
                        Upcoming
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📝</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Office Hours
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        12h
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        This week
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Calendar View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Widget */}
                <Card className="card-brand-modern lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Calendar View</CardTitle>
                    <CardDescription>
                      Your teaching schedule and important dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <span className="text-white text-3xl">📅</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          Interactive Calendar
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Full calendar view with scheduling capabilities
                        </p>
                        <Button className="btn-modern-primary">
                          <span className="mr-2">📅</span>
                          Open Calendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>
                      Your next scheduled activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🎥</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Live Session: Media Ethics
                          </h4>
                          <p className="text-sm text-gray-600">
                            Today, 2:00 PM
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">📝</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Assignment Due: News Writing
                          </h4>
                          <p className="text-sm text-gray-600">
                            Tomorrow, 11:59 PM
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">👥</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Office Hours
                          </h4>
                          <p className="text-sm text-gray-600">
                            Friday, 3:00 PM
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Quiz: Journalism Basics
                          </h4>
                          <p className="text-sm text-gray-600">
                            Monday, 10:00 AM
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Schedule Live Session</CardTitle>
                    <CardDescription>
                      Set up a live teaching session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="form-label-modern">
                          Session Title
                        </Label>
                        <Input
                          className="form-input-modern"
                          placeholder="Enter session title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">Date & Time</Label>
                        <Input
                          type="datetime-local"
                          className="form-input-modern"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">
                          Duration (minutes)
                        </Label>
                        <Input
                          type="number"
                          className="form-input-modern"
                          placeholder="60"
                        />
                      </div>
                      <Button className="btn-modern-primary w-full">
                        <span className="mr-2">🎥</span>
                        Schedule Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Set Assignment Deadline</CardTitle>
                    <CardDescription>
                      Create a new assignment deadline
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="form-label-modern">
                          Assignment Name
                        </Label>
                        <Input
                          className="form-input-modern"
                          placeholder="Enter assignment name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">Due Date</Label>
                        <Input
                          type="datetime-local"
                          className="form-input-modern"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">Course</Label>
                        <Select>
                          <SelectTrigger className="form-input-modern">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="btn-modern-primary w-full">
                        <span className="mr-2">📝</span>
                        Set Deadline
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Office Hours</CardTitle>
                    <CardDescription>
                      Schedule your availability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="form-label-modern">Day of Week</Label>
                        <Select>
                          <SelectTrigger className="form-input-modern">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">Start Time</Label>
                        <Input type="time" className="form-input-modern" />
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">End Time</Label>
                        <Input type="time" className="form-input-modern" />
                      </div>
                      <Button className="btn-modern-primary w-full">
                        <span className="mr-2">👥</span>
                        Set Office Hours
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              {/* Messages Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Messages & Communication
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Communicate with students, colleagues, and manage your inbox
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📧</span>
                    Mark All Read
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">✍️</span>
                    New Message
                  </Button>
                </div>
              </div>

              {/* Message Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📧</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Messages
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">24</div>
                      <div className="text-xs text-blue-600 font-medium">
                        This week
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">✅</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Unread
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-xs text-green-600 font-medium">
                        New messages
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">🎓</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        From Students
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">18</div>
                      <div className="text-xs text-purple-600 font-medium">
                        Student inquiries
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">👥</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        From Colleagues
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">6</div>
                      <div className="text-xs text-amber-600 font-medium">
                        Staff messages
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Message Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inbox */}
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Your recent messages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🎓</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Sarah Johnson
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            Question about assignment deadline
                          </p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">👥</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Dr. Michael Chen
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            Meeting about curriculum updates
                          </p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🎓</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            Alex Thompson
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            Request for grade review
                          </p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common communication tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start btn-modern-primary">
                        <span className="mr-2">✍️</span>
                        Compose Message
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                      >
                        <span className="mr-2">📧</span>
                        Send Announcement
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                      >
                        <span className="mr-2">👥</span>
                        Message All Students
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                      >
                        <span className="mr-2">📊</span>
                        View Message Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Message Templates */}
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>Quick message templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Welcome Message
                        </h4>
                        <p className="text-xs text-gray-600">
                          Welcome new students to your course
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Assignment Reminder
                        </h4>
                        <p className="text-xs text-gray-600">
                          Remind students about upcoming assignments
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Grade Notification
                        </h4>
                        <p className="text-xs text-gray-600">
                          Notify students about new grades
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Office Hours
                        </h4>
                        <p className="text-xs text-gray-600">
                          Share office hours information
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message Composition */}
              <Card className="card-brand-modern">
                <CardHeader>
                  <CardTitle>Compose New Message</CardTitle>
                  <CardDescription>
                    Send a message to students or colleagues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="form-label-modern">To</Label>
                        <Select>
                          <SelectTrigger className="form-input-modern">
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-students">
                              All Students
                            </SelectItem>
                            <SelectItem value="course-students">
                              Course Students
                            </SelectItem>
                            <SelectItem value="individual">
                              Individual Student
                            </SelectItem>
                            <SelectItem value="colleagues">
                              Colleagues
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="form-label-modern">
                          Course (if applicable)
                        </Label>
                        <Select>
                          <SelectTrigger className="form-input-modern">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="form-label-modern">Subject</Label>
                      <Input
                        className="form-input-modern"
                        placeholder="Enter message subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="form-label-modern">Message</Label>
                      <Textarea
                        className="form-textarea-enhanced"
                        placeholder="Type your message here..."
                        rows={6}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button className="btn-modern-primary">
                        <span className="mr-2">📧</span>
                        Send Message
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                      >
                        <span className="mr-2">💾</span>
                        Save Draft
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                      >
                        <span className="mr-2">📅</span>
                        Schedule Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              {/* Files Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    File Management
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Upload, organize, and share course materials and resources
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📁</span>
                    Create Folder
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">📤</span>
                    Upload Files
                  </Button>
                </div>
              </div>

              {/* File Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Files
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        127
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        All files
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📄</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Documents
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">45</div>
                      <div className="text-xs text-green-600 font-medium">
                        PDF, DOC files
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">🎥</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Videos
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">23</div>
                      <div className="text-xs text-purple-600 font-medium">
                        MP4, MOV files
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">💾</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Storage Used
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        2.4GB
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        Of 10GB limit
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* File Browser */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* File Tree */}
                <Card className="card-brand-modern lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Folders</CardTitle>
                    <CardDescription>Organize your files</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <span className="text-blue-600">📁</span>
                        <span className="text-sm font-medium text-gray-900">
                          Course Materials
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ml-4">
                        <span className="text-gray-600">📁</span>
                        <span className="text-sm text-gray-700">Lectures</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ml-4">
                        <span className="text-gray-600">📁</span>
                        <span className="text-sm text-gray-700">
                          Assignments
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ml-4">
                        <span className="text-gray-600">📁</span>
                        <span className="text-sm text-gray-700">Resources</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                        <span className="text-green-600">📁</span>
                        <span className="text-sm font-medium text-gray-900">
                          Shared Files
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                        <span className="text-purple-600">📁</span>
                        <span className="text-sm font-medium text-gray-900">
                          Templates
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File List */}
                <Card className="card-brand-modern lg:col-span-3">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Files</CardTitle>
                        <CardDescription>
                          Manage your uploaded files
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                        >
                          <span className="mr-1">🔍</span>
                          Search
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                        >
                          <span className="mr-1">📊</span>
                          Sort
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* File Items */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📄</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Introduction to Media.pdf
                            </h4>
                            <p className="text-sm text-gray-600">
                              2.3 MB • Uploaded 2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">👁️</span>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">📤</span>
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🎥</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Lecture 1 - Media Ethics.mp4
                            </h4>
                            <p className="text-sm text-gray-600">
                              45.2 MB • Uploaded 1 week ago
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">▶️</span>
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">📤</span>
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📊</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Assignment Template.docx
                            </h4>
                            <p className="text-sm text-gray-600">
                              1.1 MB • Uploaded 3 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">📄</span>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">📤</span>
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🖼️</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Course Banner.png
                            </h4>
                            <p className="text-sm text-gray-600">
                              3.2 MB • Uploaded 1 week ago
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">👁️</span>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                          >
                            <span className="mr-1">📤</span>
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Area */}
              <Card className="card-brand-modern">
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Drag and drop files or click to browse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">📤</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Drop files here
                    </h3>
                    <p className="text-gray-500 mb-4">
                      or click to browse your computer
                    </p>
                    <Button className="btn-modern-primary">
                      <span className="mr-2">📁</span>
                      Choose Files
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Supports: PDF, DOC, MP4, MP3, PNG, JPG (Max 100MB per
                      file)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-brand-gradient">
                    Analytics Dashboard
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Track performance, engagement, and course effectiveness
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button className="btn-modern-secondary">
                    <span className="mr-2">📊</span>
                    Export Data
                  </Button>
                  <Button className="btn-modern-primary">
                    <span className="mr-2">📈</span>
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">👥</span>
                      </div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Total Enrollments
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        {courses.reduce(
                          (acc, course) => acc + course._count.enrollments,
                          0
                        )}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        +12% this month
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📈</span>
                      </div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Completion Rate
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        78%
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        +5% this month
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">⭐</span>
                      </div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Avg Rating
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        4.8
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        Based on 127 reviews
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">⏱️</span>
                      </div>
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                        Avg Study Time
                      </CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        2.4h
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        Per student per week
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Charts and Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Progress Chart */}
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Student Progress Over Time</CardTitle>
                    <CardDescription>
                      Track how students are progressing through your courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-white text-2xl">📊</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Progress Chart
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Interactive chart will be displayed here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Performance */}
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>
                      Compare performance across different courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.slice(0, 3).map((course, index) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 line-clamp-1">
                                {course.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {course._count.enrollments} students
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              85%
                            </div>
                            <div className="text-xs text-gray-500">
                              completion
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Student Engagement</CardTitle>
                    <CardDescription>
                      How actively students are participating
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Daily Active Users
                        </span>
                        <span className="font-semibold text-gray-900">45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Weekly Active Users
                        </span>
                        <span className="font-semibold text-gray-900">127</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Monthly Active Users
                        </span>
                        <span className="font-semibold text-gray-900">234</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Content Performance</CardTitle>
                    <CardDescription>
                      Most and least engaging content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Most Viewed Lesson
                        </span>
                        <span className="font-semibold text-gray-900 text-right line-clamp-1">
                          Introduction to Media
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Avg. Time per Lesson
                        </span>
                        <span className="font-semibold text-gray-900">
                          24 min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Drop-off Rate
                        </span>
                        <span className="font-semibold text-gray-900">12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-brand-modern">
                  <CardHeader>
                    <CardTitle>Assessment Results</CardTitle>
                    <CardDescription>
                      Student performance on assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Avg. Quiz Score
                        </span>
                        <span className="font-semibold text-gray-900">87%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pass Rate</span>
                        <span className="font-semibold text-gray-900">92%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Retake Rate
                        </span>
                        <span className="font-semibold text-gray-900">18%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                <AnnouncementManagement
                  announcements={announcements}
                  onCreateAnnouncement={handleCreateAnnouncement}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onPublishAnnouncement={handlePublishAnnouncement}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
