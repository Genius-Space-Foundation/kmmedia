"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

interface StudentActivity {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
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
  recentActivities: Activity[];
  performanceMetrics: {
    averageScore: number;
    completionRate: number;
    participationRate: number;
    assignmentsSubmitted: number;
    assignmentsPending: number;
  };
  riskFactors: string[];
  strengths: string[];
}

interface Activity {
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

  useEffect(() => {
    fetchStudentActivities();
  }, []);

  const fetchStudentActivities = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockActivities: StudentActivity[] = [
        {
          id: "1",
          student: {
            id: "s1",
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
            avatar: "/avatars/sarah.jpg",
          },
          course: {
            id: "c1",
            title: "Digital Photography Basics",
          },
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          totalTimeSpent: 1240,
          weeklyTimeSpent: 180,
          progress: 78,
          engagementScore: 92,
          status: "excelling",
          recentActivities: [
            {
              id: "a1",
              type: "assignment_submitted",
              title: "Portrait Photography Assignment",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              score: 95,
            },
            {
              id: "a2",
              type: "lesson_completed",
              title: "Advanced Lighting Techniques",
              timestamp: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
              duration: 45,
            },
          ],
          performanceMetrics: {
            averageScore: 89,
            completionRate: 95,
            participationRate: 88,
            assignmentsSubmitted: 8,
            assignmentsPending: 1,
          },
          riskFactors: [],
          strengths: [
            "Consistent engagement",
            "High-quality submissions",
            "Active participation",
          ],
        },
        {
          id: "2",
          student: {
            id: "s2",
            name: "Michael Chen",
            email: "m.chen@email.com",
            avatar: "/avatars/michael.jpg",
          },
          course: {
            id: "c2",
            title: "Video Production Mastery",
          },
          lastActivity: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          totalTimeSpent: 680,
          weeklyTimeSpent: 45,
          progress: 34,
          engagementScore: 45,
          status: "at_risk",
          recentActivities: [
            {
              id: "a3",
              type: "resource_accessed",
              title: "Video Editing Software Guide",
              timestamp: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
          performanceMetrics: {
            averageScore: 72,
            completionRate: 60,
            participationRate: 40,
            assignmentsSubmitted: 3,
            assignmentsPending: 4,
          },
          riskFactors: [
            "Low engagement",
            "Missing assignments",
            "Infrequent login",
          ],
          strengths: ["Good technical understanding"],
        },
        {
          id: "3",
          student: {
            id: "s3",
            name: "Emma Rodriguez",
            email: "emma.r@email.com",
            avatar: "/avatars/emma.jpg",
          },
          course: {
            id: "c1",
            title: "Digital Photography Basics",
          },
          lastActivity: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          totalTimeSpent: 920,
          weeklyTimeSpent: 120,
          progress: 65,
          engagementScore: 78,
          status: "active",
          recentActivities: [
            {
              id: "a4",
              type: "quiz_taken",
              title: "Composition Fundamentals Quiz",
              timestamp: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              score: 85,
            },
            {
              id: "a5",
              type: "discussion_posted",
              title: "Weekly Photography Challenge",
              timestamp: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
          performanceMetrics: {
            averageScore: 82,
            completionRate: 78,
            participationRate: 75,
            assignmentsSubmitted: 6,
            assignmentsPending: 2,
          },
          riskFactors: [],
          strengths: ["Regular participation", "Steady progress"],
        },
      ];

      const mockMetrics: ActivityMetrics = {
        totalStudents: 45,
        activeStudents: 32,
        atRiskStudents: 8,
        excellingStudents: 12,
        averageEngagement: 74,
        averageProgress: 68,
        weeklyActiveHours: 1240,
        completionTrend: 5.2,
      };

      setStudentActivities(mockActivities);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error fetching student activities:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
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

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
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

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
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

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
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
                          onClick={() =>
                            onViewStudent(studentActivity.student.id)
                          }
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
