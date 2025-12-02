"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Activity,
  BookOpen,
  Target,
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Zap,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  MoreVertical,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface StudentActivity {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatar?: string;
    joinedAt: string;
  };
  course: {
    id: string;
    title: string;
  };
  lastActivity: string;
  totalTimeSpent: number; // in minutes
  weeklyTimeSpent: number;
  progress: number;
  engagementScore: number;
  status: "active" | "at_risk" | "inactive" | "excelling";
  recentActivities: ActivityItem[];
  performanceMetrics: {
    averageScore: number;
    completionRate: number;
    participationRate: number;
    assignmentsSubmitted: number;
    assignmentsPending: number;
  };
  riskFactors: string[];
  strengths: string[];
  notes?: string[];
}

interface ActivityItem {
  id: string;
  type:
    | "lesson_completed"
    | "assignment_submitted"
    | "quiz_taken"
    | "discussion_posted"
    | "resource_accessed";
  title: string;
  timestamp: string;
  score?: number;
  duration?: number;
}

interface ActivityMetrics {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  excellingStudents: number;
  averageEngagement: number;
  averageProgress: number;
  weeklyActiveHours: number;
  completionTrend: number;
}

interface EnhancedStudentActivityMonitoringProps {
  onViewStudent: (studentId: string) => void;
  onSendMessage: (studentId: string) => void;
  onCreateIntervention: (studentId: string) => void;
}

export default function EnhancedStudentActivityMonitoring({
  onViewStudent,
  onSendMessage,
  onCreateIntervention,
}: EnhancedStudentActivityMonitoringProps) {
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(
    []
  );
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    totalStudents: 0,
    activeStudents: 0,
    atRiskStudents: 0,
    excellingStudents: 0,
    averageEngagement: 0,
    averageProgress: 0,
    weeklyActiveHours: 0,
    completionTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "engagement" | "progress" | "lastActivity" | "risk"
  >("engagement");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentActivities();
  }, []);

  const fetchStudentActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/students?status=${statusFilter}&search=${searchTerm}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(errorData.message || "Failed to fetch students");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudentActivities(data.data.students || []);
        
        // Calculate aggregate metrics from the fetched data
        const students = data.data.students || [];
        const metrics: ActivityMetrics = {
          totalStudents: students.length,
          activeStudents: students.filter((s: any) => s.status === 'active').length,
          atRiskStudents: students.filter((s: any) => s.status === 'at_risk').length,
          excellingStudents: students.filter((s: any) => s.status === 'excelling').length,
          averageEngagement: students.length > 0 ? Math.round(students.reduce((acc: number, s: any) => acc + (s.engagementScore || 0), 0) / students.length) : 0,
          averageProgress: students.length > 0 ? Math.round(students.reduce((acc: number, s: any) => acc + (s.progress || 0), 0) / students.length) : 0,
          weeklyActiveHours: students.length > 0 ? Math.round(students.reduce((acc: number, s: any) => acc + (s.weeklyTimeSpent || 0), 0) / 60) : 0,
          completionTrend: 0, // Need historical data for this
        };
        setMetrics(metrics);
      }
    } catch (error) {
      console.error("Error fetching student activities:", error);
      // Set empty state on error
      setStudentActivities([]);
      setMetrics({
        totalStudents: 0,
        activeStudents: 0,
        atRiskStudents: 0,
        excellingStudents: 0,
        averageEngagement: 0,
        averageProgress: 0,
        weeklyActiveHours: 0,
        completionTrend: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    try {
      const response = await fetch(`/api/instructor/students/${studentId}/progress`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch student details");
      
      const data = await response.json();
      
      if (data.success) {
        // Update the specific student in the list with detailed data
        setStudentActivities(prev => prev.map(s => 
          s.student.id === studentId ? { ...s, ...data.data } : s
        ));
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentDetails(selectedStudentId);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchStudentActivities();
  }, [statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excelling":
        return "bg-green-100 text-green-800 border-green-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "at_risk":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excelling":
        return <TrendingUp className="h-4 w-4" />;
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4" />;
      case "inactive":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return "📚";
      case "assignment_submitted":
        return "📝";
      case "quiz_taken":
        return "❓";
      case "discussion_posted":
        return "💬";
      case "resource_accessed":
        return "📖";
      default:
        return "📄";
    }
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getTimeSinceLastActivity = (timestamp: string) => {
    const now = new Date();
    const activity = new Date(timestamp);
    const diffTime = now.getTime() - activity.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const filteredStudents = studentActivities.filter((student) => {
    const matchesSearch =
      student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    const matchesCourse =
      courseFilter === "all" || student.course.id === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "engagement":
        return b.engagementScore - a.engagementScore;
      case "progress":
        return b.progress - a.progress;
      case "lastActivity":
        return (
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
        );
      case "risk":
        return b.riskFactors.length - a.riskFactors.length;
      default:
        return 0;
    }
  });

  const selectedStudent = studentActivities.find(s => s.student.id === selectedStudentId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedStudent) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStudentId(null)}
          className="mb-4 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Student List
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Profile Card */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={selectedStudent.student.avatar} />
                  <AvatarFallback className="text-2xl">
                    {selectedStudent.student.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900">{selectedStudent.student.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{selectedStudent.course.title}</p>
                <Badge className={getStatusColor(selectedStudent.status)}>
                  {getStatusIcon(selectedStudent.status)}
                  <span className="ml-1 capitalize">{selectedStudent.status.replace("_", " ")}</span>
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  {selectedStudent.student.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  {selectedStudent.student.phone || "N/A"}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  {selectedStudent.student.location || "N/A"}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  Joined {new Date(selectedStudent.student.joinedAt).toLocaleDateString()}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Button className="w-full" onClick={() => onSendMessage(selectedStudent.student.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                </Button>
                <Button variant="outline" className="w-full" onClick={() => onCreateIntervention(selectedStudent.student.id)}>
                  <Zap className="h-4 w-4 mr-2" /> Create Intervention
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Overall Progress</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{selectedStudent.progress}%</span>
                    <TrendingUp className="h-4 w-4 text-green-500 mb-1" />
                  </div>
                  <Progress value={selectedStudent.progress} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Engagement Score</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{selectedStudent.engagementScore}</span>
                    <Activity className="h-4 w-4 text-blue-500 mb-1" />
                  </div>
                  <Progress value={selectedStudent.engagementScore} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Avg. Quiz Score</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{selectedStudent.performanceMetrics.averageScore}%</span>
                    <Target className="h-4 w-4 text-purple-500 mb-1" />
                  </div>
                  <Progress value={selectedStudent.performanceMetrics.averageScore} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="activity">Activity History</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="notes">Notes & Risks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedStudent.recentActivities.map((activity, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-lg z-10">
                              {getActivityIcon(activity.type)}
                            </div>
                            {index !== selectedStudent.recentActivities.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-100 -my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(activity.timestamp).toLocaleString()}
                              {activity.score && (
                                <Badge variant="secondary" className="ml-2">
                                  Score: {activity.score}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Assignments Submitted</p>
                          <p className="text-2xl font-bold">{selectedStudent.performanceMetrics.assignmentsSubmitted}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Pending Assignments</p>
                          <p className="text-2xl font-bold">{selectedStudent.performanceMetrics.assignmentsPending}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Participation Rate</p>
                          <p className="text-2xl font-bold">{selectedStudent.performanceMetrics.participationRate}%</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Completion Rate</p>
                          <p className="text-2xl font-bold">{selectedStudent.performanceMetrics.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Factors & Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedStudent.riskFactors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-700 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" /> Risk Factors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.riskFactors.map((factor, i) => (
                              <Badge key={i} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.strengths.map((strength, i) => (
                            <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" /> Instructor Notes
                        </h4>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-900">
                          {selectedStudent.notes?.map((note, i) => (
                            <p key={i} className="mb-2 last:mb-0">• {note}</p>
                          )) || "No notes added yet."}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // List/Grid View
  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {metrics.activeStudents}
                </p>
                <p className="text-sm text-blue-700">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {metrics.excellingStudents}
                </p>
                <p className="text-sm text-green-700">Excelling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {metrics.atRiskStudents}
                </p>
                <p className="text-sm text-orange-700">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {metrics.averageEngagement}%
                </p>
                <p className="text-sm text-purple-700">Avg Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Student Activity Monitoring</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="excelling">Excelling</option>
                <option value="active">Active</option>
                <option value="at_risk">At Risk</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="engagement">Engagement</option>
                <option value="progress">Progress</option>
                <option value="lastActivity">Last Activity</option>
                <option value="risk">Risk Level</option>
              </select>
            </div>
          </div>

          {/* Student List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {sortedStudents.map((studentActivity) => (
              <Card
                key={studentActivity.id}
                className="border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={studentActivity.student.avatar} />
                      <AvatarFallback>
                        {studentActivity.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {studentActivity.student.name}
                        </h3>
                        <Badge
                          className={getStatusColor(studentActivity.status)}
                        >
                          {getStatusIcon(studentActivity.status)}
                          <span className="ml-1 capitalize">
                            {studentActivity.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {studentActivity.course.title}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {studentActivity.progress}%
                            </span>
                          </div>
                          <Progress
                            value={studentActivity.progress}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Engagement</span>
                            <span className="font-medium">
                              {studentActivity.engagementScore}%
                            </span>
                          </div>
                          <Progress
                            value={studentActivity.engagementScore}
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTimeSpent(studentActivity.weeklyTimeSpent)}{" "}
                            this week
                          </span>
                        </span>
                        <span>
                          Last active:{" "}
                          {getTimeSinceLastActivity(
                            studentActivity.lastActivity
                          )}
                        </span>
                      </div>

                      {/* Recent Activities */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Recent Activities
                        </h4>
                        <div className="space-y-1">
                          {studentActivity.recentActivities
                            .slice(0, 2)
                            .map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center space-x-2 text-sm"
                              >
                                <span>{getActivityIcon(activity.type)}</span>
                                <span className="text-gray-600 truncate">
                                  {activity.title}
                                </span>
                                {activity.score && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.score}%
                                  </Badge>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {studentActivity.riskFactors.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-red-700 mb-1">
                            Risk Factors
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {studentActivity.riskFactors
                              .slice(0, 2)
                              .map((factor, index) => (
                                <Badge
                                  key={index}
                                  className="bg-red-100 text-red-800 text-xs"
                                >
                                  {factor}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setSelectedStudentId(studentActivity.student.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        <Button
                          onClick={() =>
                            onSendMessage(studentActivity.student.id)
                          }
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>

                        {studentActivity.status === "at_risk" && (
                          <Button
                            onClick={() =>
                              onCreateIntervention(studentActivity.student.id)
                            }
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Intervene
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedStudents.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No students found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
