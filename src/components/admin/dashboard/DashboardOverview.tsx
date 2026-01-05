"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
  users: any[];
  courses: any[];
  applications: any[];
  onCreateCourse?: () => void;
}

export default function DashboardOverview({
  stats,
  loading,
  users,
  courses,
  applications,
  onCreateCourse,
}: DashboardOverviewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      change: "+12.5%",
      trend: "up",
      color: "blue",
      subtitle: "Active users",
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      change: "+8.2%",
      trend: "up",
      color: "purple",
      subtitle: "Published courses",
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      icon: FileText,
      change: "+15.3%",
      trend: "up",
      color: "orange",
      subtitle: "Awaiting review",
    },
    {
      title: "Total Revenue",
      value: `GH₵${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+23.1%",
      trend: "up",
      color: "green",
      subtitle: "All time",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-0 bg-white/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          stat.trend === "up"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {stat.change}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {stat.subtitle}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Applications</span>
              <Badge variant="outline">{applications.slice(0, 5).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.slice(0, 5).map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {app.user?.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {app.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {app.course?.title || "Unknown Course"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      app.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : app.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>New Users</span>
              <Badge variant="outline">{users.slice(0, 5).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50/30 hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : user.role === "INSTRUCTOR"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Courses */}
      <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Popular Courses</span>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses.slice(0, 6).map((course: any) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50/30 hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      By {course.instructor?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      GH₵{(course.price || 0).toLocaleString()}
                    </p>
                    <Badge
                      className={
                        course.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : course.status === "PENDING_APPROVAL"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {course.status || "DRAFT"}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="h-20 flex-col bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Users className="h-6 w-6 mb-2" />
              Add User
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex-col bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={onCreateCourse}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              Create Course
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex-col bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <FileText className="h-6 w-6 mb-2" />
              Review Apps
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex-col bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <DollarSign className="h-6 w-6 mb-2" />
              View Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
