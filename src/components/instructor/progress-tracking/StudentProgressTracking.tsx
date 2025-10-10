"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Eye,
  MessageSquare,
  Send,
  Star,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseId: string;
  courseTitle: string;
  enrollmentDate: string;
  lastActivity: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  completedAssessments: number;
  totalAssessments: number;
  averageScore: number;
  timeSpent: number; // in hours
  attendance: number; // percentage
  engagementScore: number;
  status: "ON_TRACK" | "AT_RISK" | "NEEDS_ATTENTION" | "EXCELLING";
  milestones: Milestone[];
  recentActivities: Activity[];
  strengths: string[];
  improvements: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "OVERDUE";
  progress: number;
}

interface Activity {
  id: string;
  type: "LESSON" | "ASSESSMENT" | "DISCUSSION" | "SUBMISSION" | "LOGIN";
  title: string;
  description: string;
  date: string;
  duration?: number;
  score?: number;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
}

interface Course {
  id: string;
  title: string;
  description: string;
  _count: {
    students: number;
    lessons: number;
    assessments: number;
  };
}

interface ProgressMetrics {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  averageProgress: number;
  averageScore: number;
  completionRate: number;
  engagementRate: number;
}

export default function StudentProgressTracking() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchCourses();

    // Check if course is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("course");
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentProgress(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      if (typeof window === "undefined") return;

      const response = await makeAuthenticatedRequest(
        "/api/instructor/courses"
      );
      if (response.ok) {
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (courseId: string) => {
    try {
      if (typeof window === "undefined") return;

      const response = await makeAuthenticatedRequest(
        `/api/instructor/courses/${courseId}/progress`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching student progress:", error);
    }
  };

  const getProgressMetrics = (): ProgressMetrics => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        atRiskStudents: 0,
        averageProgress: 0,
        averageScore: 0,
        completionRate: 0,
        engagementRate: 0,
      };
    }

    const activeStudents = students.filter(
      (s) =>
        new Date(s.lastActivity).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;

    const atRiskStudents = students.filter(
      (s) => s.status === "AT_RISK" || s.status === "NEEDS_ATTENTION"
    ).length;

    const averageProgress =
      students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length;

    const averageScore =
      students.reduce((sum, s) => sum + s.averageScore, 0) / students.length;

    const completionRate =
      students.filter((s) => s.overallProgress >= 100).length / students.length;

    const averageEngagement =
      students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length;

    return {
      totalStudents: students.length,
      activeStudents,
      atRiskStudents,
      averageProgress: Math.round(averageProgress),
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate * 100),
      engagementRate: Math.round(averageEngagement),
    };
  };

  const getStatusColor = (
    status: StudentProgress["status"]
  ): { bg: string; text: string; icon: any } => {
    switch (status) {
      case "EXCELLING":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: TrendingUp,
        };
      case "ON_TRACK":
        return { bg: "bg-blue-100", text: "text-blue-800", icon: CheckCircle };
      case "AT_RISK":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          icon: AlertCircle,
        };
      case "NEEDS_ATTENTION":
        return { bg: "bg-red-100", text: "text-red-800", icon: TrendingDown };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: Minus };
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "ALL" || student.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort by status priority: NEEDS_ATTENTION > AT_RISK > ON_TRACK > EXCELLING
      const statusOrder = {
        NEEDS_ATTENTION: 0,
        AT_RISK: 1,
        ON_TRACK: 2,
        EXCELLING: 3,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metrics = getProgressMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Progress Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and analyze student progress and engagement
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>
            Choose a course to track student progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{course.title}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary">
                        {course._count.students} students
                      </Badge>
                      <Badge variant="outline">
                        {course._count.lessons} lessons
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.totalStudents}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.activeStudents} active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Progress
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.averageProgress}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.completionRate}% completion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Score
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.averageScore}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.engagementRate}% engagement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">At Risk</p>
                    <p className="text-2xl font-bold">
                      {metrics.atRiskStudents}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (metrics.atRiskStudents / metrics.totalStudents) * 100
                      )}
                      % of students
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="individual">Individual Progress</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Filters */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Student Progress Overview</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="EXCELLING">Excelling</SelectItem>
                        <SelectItem value="ON_TRACK">On Track</SelectItem>
                        <SelectItem value="AT_RISK">At Risk</SelectItem>
                        <SelectItem value="NEEDS_ATTENTION">
                          Needs Attention
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student Progress Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => {
                      const statusInfo = getStatusColor(student.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <Card
                          key={student.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailDialog(true);
                          }}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {student.studentName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {student.studentName}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    {student.studentEmail}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                className={`${statusInfo.bg} ${statusInfo.text}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {student.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Overall Progress */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">
                                    Overall Progress
                                  </span>
                                  <span className="text-sm font-bold">
                                    {student.overallProgress}%
                                  </span>
                                </div>
                                <Progress
                                  value={student.overallProgress}
                                  className="h-2"
                                />
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Lessons
                                      </p>
                                      <p className="text-sm font-bold">
                                        {student.completedLessons}/
                                        {student.totalLessons}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2 bg-green-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-green-600" />
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Score
                                      </p>
                                      <p className="text-sm font-bold">
                                        {student.averageScore}%
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2 bg-purple-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Time
                                      </p>
                                      <p className="text-sm font-bold">
                                        {student.timeSpent}h
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2 bg-orange-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-600" />
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Engagement
                                      </p>
                                      <p className="text-sm font-bold">
                                        {student.engagementScore}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Last Activity */}
                              <div className="pt-3 border-t">
                                <p className="text-xs text-gray-600">
                                  Last active:{" "}
                                  {new Date(
                                    student.lastActivity
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No students found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Student Progress</CardTitle>
                  <CardDescription>
                    Select a student to view detailed progress information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-12">
                    Click on a student card in the Overview tab to view detailed
                    progress
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Progress Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Progress distribution chart would go here
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Engagement Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Engagement trend chart would go here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="interventions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Interventions</CardTitle>
                  <CardDescription>
                    Students requiring attention or intervention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredStudents
                      .filter(
                        (s) =>
                          s.status === "AT_RISK" ||
                          s.status === "NEEDS_ATTENTION"
                      )
                      .map((student) => (
                        <div
                          key={student.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                {student.studentName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {student.studentName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {student.studentEmail}
                                </p>
                              </div>
                            </div>
                            <Badge variant="destructive">
                              {student.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            <h5 className="text-sm font-medium">Issues:</h5>
                            <ul className="text-sm space-y-1">
                              {student.improvements.map((issue, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-gray-600"
                                >
                                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}

                    {filteredStudents.filter(
                      (s) =>
                        s.status === "AT_RISK" || s.status === "NEEDS_ATTENTION"
                    ).length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          All students on track
                        </h3>
                        <p className="text-gray-600">
                          No students require immediate attention
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Student Detail Dialog */}
          {selectedStudent && (
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedStudent.studentName} - Detailed Progress
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive progress and performance analysis
                  </DialogDescription>
                </DialogHeader>
                {renderStudentDetail(selectedStudent)}
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );

  function renderStudentDetail(student: StudentProgress) {
    const statusInfo = getStatusColor(student.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="space-y-6">
        {/* Student Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {student.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{student.studentName}</h3>
              <p className="text-sm text-gray-600">{student.studentEmail}</p>
              <p className="text-xs text-gray-500 mt-1">
                Enrolled:{" "}
                {new Date(student.enrollmentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={`${statusInfo.bg} ${statusInfo.text} px-4 py-2`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {student.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold">
                    {student.overallProgress}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{student.averageScore}%</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-2xl font-bold">
                    {student.engagementScore}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold">{student.timeSpent}h</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lessons Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lesson Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed Lessons</span>
                  <span className="font-bold">
                    {student.completedLessons} / {student.totalLessons}
                  </span>
                </div>
                <Progress
                  value={
                    (student.completedLessons / student.totalLessons) * 100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assessment Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed Assessments</span>
                  <span className="font-bold">
                    {student.completedAssessments} / {student.totalAssessments}
                  </span>
                </div>
                <Progress
                  value={
                    (student.completedAssessments / student.totalAssessments) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {student.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-red-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {student.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === "COMPLETED"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    {activity.score !== undefined && (
                      <p className="text-sm font-medium">{activity.score}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    );
  }
}
