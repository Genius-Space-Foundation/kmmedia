"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";


interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledAt: string;
  progress: number;
  lastActivity: string;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED";
  course: {
    id: string;
    title: string;
    category: string;
  };
  recentCompletions: LessonCompletion[];
  recentSubmissions: AssessmentSubmission[];
  timeSpent: number;
  engagementScore: number;
  performanceMetrics: {
    averageScore: number;
    completionRate: number;
    participationRate: number;
  };
}

interface LessonCompletion {
  id: string;
  lesson: {
    id: string;
    title: string;
    type: string;
    duration: number;
  };
  completedAt: string;
}

interface AssessmentSubmission {
  id: string;
  assessment: {
    id: string;
    title: string;
    type: string;
    totalPoints: number;
  };
  score: number;
  submittedAt: string;
}

interface EngagementMetrics {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageEngagement: number;
  completionRate: number;
  atRiskStudents: number;
}

export default function StudentAnalytics() {
  const [students, setStudents] = useState<Student[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>(
    {
      totalStudents: 0,
      activeStudents: 0,
      averageProgress: 0,
      averageEngagement: 0,
      completionRate: 0,
      atRiskStudents: 0,
    }
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [studentsRes, metricsRes] = await Promise.all([
        fetch("/api/instructor/students", { credentials: "include" }),
        fetch("/api/instructor/student-metrics", { credentials: "include" }),
      ]);

      const [studentsData, metricsData] = await Promise.all([
        studentsRes.json(),
        metricsRes.json(),
      ]);

      if (studentsData.success) {
        const studentsArray = Array.isArray(studentsData.data)
          ? studentsData.data
          : studentsData.data?.students || [];
        setStudents(studentsArray);
      }
      if (metricsData.success) {
        setEngagementMetrics(metricsData.data || {});
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredStudents = (Array.isArray(students) ? students : []).filter(
    (student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || student.status === statusFilter;
      const matchesCourse =
        courseFilter === "ALL" || student.course?.id === courseFilter;
      return matchesSearch && matchesStatus && matchesCourse;
    }
  );

  const atRiskStudents = (Array.isArray(students) ? students : []).filter(
    (student) => student.engagementScore < 50 || student.progress < 30
  );

  const topPerformers = (Array.isArray(students) ? students : [])
    .filter((student) => student.status === "ACTIVE")
    .sort(
      (a, b) =>
        (b.performanceMetrics?.averageScore || 0) -
        (a.performanceMetrics?.averageScore || 0)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Analytics</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementMetrics.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementMetrics.activeStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (engagementMetrics.activeStudents /
                  engagementMetrics.totalStudents) *
                  100
              )}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Progress
            </CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementMetrics.averageProgress}%
            </div>
            <p className="text-xs text-muted-foreground">
              Course completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              At-Risk Students
            </CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {engagementMetrics.atRiskStudents}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student List</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Students with highest performance scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.course?.title || "No Course"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {student.performanceMetrics?.averageScore || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Average Score
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
                <CardDescription>Student engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Engagement</span>
                    <span className="text-sm font-medium">
                      {engagementMetrics.averageEngagement}%
                    </span>
                  </div>
                  <Progress
                    value={engagementMetrics.averageEngagement}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-sm font-medium">
                      {engagementMetrics.completionRate}%
                    </span>
                  </div>
                  <Progress
                    value={engagementMetrics.completionRate}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Progress</span>
                    <span className="text-sm font-medium">
                      {engagementMetrics.averageProgress}%
                    </span>
                  </div>
                  <Progress
                    value={engagementMetrics.averageProgress}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Courses</SelectItem>
                {Array.from(new Set(students.map((s) => s.course.id))).map(
                  (courseId) => {
                    const course = students.find(
                      (s) => s.course.id === courseId
                    )?.course;
                    return (
                      <SelectItem key={courseId} value={courseId}>
                        {course?.title}
                      </SelectItem>
                    );
                  }
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{student.email}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{student.progress}%</span>
                    </div>
                    <Progress
                      value={student.progress}
                      className="h-2"
                      style={{
                        backgroundColor: getProgressColor(student.progress),
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Course:</span>
                      <p className="text-muted-foreground">
                        {student.course?.title || "No Course"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Time Spent:</span>
                      <p className="text-muted-foreground">
                        {formatTimeSpent(student.timeSpent)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Engagement:</span>
                      <p
                        className={`font-medium ${getEngagementColor(
                          student.engagementScore
                        )}`}
                      >
                        {student.engagementScore}%
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Avg Score:</span>
                      <p className="text-muted-foreground">
                        {student.performanceMetrics?.averageScore || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedStudent(student)}
                    >
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {atRiskStudents.map((student) => (
              <Card
                key={student.id}
                className="border-red-200 hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-red-800">
                        {student.name}
                      </CardTitle>
                      <CardDescription>{student.email}</CardDescription>
                    </div>
                    <Badge className="bg-red-100 text-red-800">At Risk</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="text-red-600">{student.progress}%</span>
                    </div>
                    <Progress
                      value={student.progress}
                      className="h-2 bg-red-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement</span>
                      <span className="text-red-600">
                        {student.engagementScore}%
                      </span>
                    </div>
                    <Progress
                      value={student.engagementScore}
                      className="h-2 bg-red-100"
                    />
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Course:</span>
                    <p className="text-muted-foreground">
                      {student.course?.title || "No Course"}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Send Reminder
                    </Button>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
