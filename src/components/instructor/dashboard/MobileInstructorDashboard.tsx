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
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  Download,
  Share2,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface MobileStats {
  totalCourses: number;
  activeStudents: number;
  pendingAssessments: number;
  unreadMessages: number;
  completionRate: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: string;
  type: string;
  priority: string;
}

export default function MobileInstructorDashboard() {
  const [stats, setStats] = useState<MobileStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      setLoading(true);

      // Fetch stats
      const statsResponse = await makeAuthenticatedRequest(
        "/api/instructor/stats"
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent activities
      const activitiesResponse = await makeAuthenticatedRequest(
        "/api/instructor/activity"
      );
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        // Ensure activitiesData is an array before slicing
        const activities = Array.isArray(activitiesData) ? activitiesData : [];
        setActivities(activities.slice(0, 5)); // Limit for mobile
      }

      // Fetch deadlines
      const deadlinesResponse = await makeAuthenticatedRequest(
        "/api/instructor/deadlines"
      );
      if (deadlinesResponse.ok) {
        const deadlinesData = await deadlinesResponse.json();
        // Ensure deadlinesData is an array before slicing
        const deadlines = Array.isArray(deadlinesData) ? deadlinesData : [];
        setDeadlines(deadlines.slice(0, 3)); // Limit for mobile
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course":
        return BookOpen;
      case "student":
        return Users;
      case "assessment":
        return FileText;
      case "message":
        return MessageSquare;
      default:
        return Clock;
    }
  };

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
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold">
                  {stats?.activeStudents || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assessments</p>
                <p className="text-2xl font-bold">
                  {stats?.pendingAssessments || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold">
                  {stats?.unreadMessages || 0}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion Rate</span>
              <span>{stats?.completionRate || 0}%</span>
            </div>
            <Progress value={stats?.completionRate || 0} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Average Rating</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{stats?.averageRating || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 3).map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3"
                    >
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusColor(activity.status) as any}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">All Activity</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusColor(activity.status) as any}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {deadline.dueDate}
                      </p>
                    </div>
                    <Badge
                      variant={getPriorityColor(deadline.priority) as any}
                      className="text-xs"
                    >
                      {deadline.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-12 flex flex-col items-center space-y-1">
              <Plus className="h-5 w-5" />
              <span className="text-xs">New Course</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center space-y-1"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Assessment</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center space-y-1"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Message</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 flex flex-col items-center space-y-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
