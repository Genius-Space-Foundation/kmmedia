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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  MessageSquare,
  BookOpen,
  Target,
  Award,
  Activity,
  BarChart3,
} from "lucide-react";


interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number;
  engagement: number;
  lastActive: string;
  coursesEnrolled: number;
  assignmentsCompleted: number;
  averageGrade: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  status: "ACTIVE" | "AT_RISK" | "INACTIVE";
}

interface StudentMetrics {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  averageProgress: number;
  averageEngagement: number;
  completionRate: number;
  averageGrade: number;
}

export default function MobileStudentAnalytics() {
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<StudentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sortBy, setSortBy] = useState("progress");

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchStudentData();
    }
  }, []);

  const fetchStudentData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      setLoading(true);

      // Fetch student metrics
      const metricsResponse = await fetch(
        "/api/instructor/student-metrics"
      );
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch students list
      const studentsResponse = await fetch(
        "/api/instructor/students"
      );
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "AT_RISK":
        return "destructive";
      case "INACTIVE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return "text-green-600";
    if (engagement >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const sortedStudents = Array.isArray(students)
    ? [...students].sort((a, b) => {
        switch (sortBy) {
          case "progress":
            return b.progress - a.progress;
          case "engagement":
            return b.engagement - a.engagement;
          case "grade":
            return b.averageGrade - a.averageGrade;
          case "risk":
            const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
          default:
            return 0;
        }
      })
    : [];

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">
                  {metrics?.totalStudents || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {metrics?.activeStudents || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics?.atRiskStudents || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {metrics?.averageProgress || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Average Progress</span>
              <span>{metrics?.averageProgress || 0}%</span>
            </div>
            <Progress value={metrics?.averageProgress || 0} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion Rate</span>
              <span>{metrics?.completionRate || 0}%</span>
            </div>
            <Progress value={metrics?.completionRate || 0} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Average Grade</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">
                {metrics?.averageGrade || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">All Students</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Students</h3>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="progress">Progress</option>
                <option value="engagement">Engagement</option>
                <option value="grade">Grade</option>
                <option value="risk">Risk Level</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {sortedStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm truncate">
                          {student.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={getRiskColor(student.riskLevel) as any}
                            className="text-xs"
                          >
                            {student.riskLevel}
                          </Badge>
                          <Badge
                            variant={getStatusColor(student.status) as any}
                            className="text-xs"
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 truncate">
                        {student.email}
                      </p>

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>{student.progress}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span
                            className={getEngagementColor(student.engagement)}
                          >
                            {student.engagement}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{student.averageGrade}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <div className="space-y-3">
            {Array.isArray(students)
              ? students.filter(
                  (s) => s.riskLevel === "HIGH" || s.status === "AT_RISK"
                )
              : [].map((student) => (
                  <Card key={student.id} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-red-900">
                              {student.name}
                            </h4>
                            <Badge variant="destructive" className="text-xs">
                              {student.riskLevel} RISK
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-500">
                            {student.email}
                          </p>

                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <div className="flex items-center space-x-1 text-red-600">
                              <Target className="h-3 w-3" />
                              <span>{student.progress}% Progress</span>
                            </div>
                            <div className="flex items-center space-x-1 text-red-600">
                              <Activity className="h-3 w-3" />
                              <span>{student.engagement}% Engagement</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="top-performers" className="space-y-4">
          <div className="space-y-3">
            {Array.isArray(students)
              ? students.filter((s) => s.progress >= 80 && s.engagement >= 70)
              : [].map((student) => (
                  <Card key={student.id} className="border-neutral-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-green-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-green-900">
                              {student.name}
                            </h4>
                            <Badge
                              variant="default"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              TOP PERFORMER
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-500">
                            {student.email}
                          </p>

                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <div className="flex items-center space-x-1 text-green-600">
                              <Target className="h-3 w-3" />
                              <span>{student.progress}% Progress</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                              <Activity className="h-3 w-3" />
                              <span>{student.engagement}% Engagement</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                              <Star className="h-3 w-3" />
                              <span>{student.averageGrade} Grade</span>
                            </div>
                          </div>
                        </div>
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
