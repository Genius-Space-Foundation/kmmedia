"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";

interface CourseProgressVisualizationProps {
  enrollments: any[];
  onContinueCourse: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
}

export default function CourseProgressVisualization({
  enrollments,
  onContinueCourse,
  onViewCourse,
}: CourseProgressVisualizationProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-600";
    if (progress >= 50) return "bg-blue-600";
    if (progress >= 25) return "bg-yellow-600";
    return "bg-gray-500";
  };

  const getStatusBadge = (status: string, progress: number) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "ACTIVE":
        if (progress > 0) {
          return (
            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
          );
        }
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Not Started</Badge>
        );
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const calculateTimeSpent = (timeSpent: number) => {
    const hours = Math.floor(timeSpent / 60);
    const minutes = timeSpent % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEstimatedCompletion = (progress: number, timeSpent: number) => {
    if (progress === 0) return "Not started";
    if (progress === 100) return "Completed";

    const estimatedTotalTime = (timeSpent / progress) * 100;
    const remainingTime = estimatedTotalTime - timeSpent;
    const remainingHours = Math.ceil(remainingTime / 60);

    if (remainingHours < 1) return "Less than 1 hour";
    if (remainingHours === 1) return "About 1 hour";
    if (remainingHours < 24) return `About ${remainingHours} hours`;

    const remainingDays = Math.ceil(remainingHours / 24);
    return `About ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
  };

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Courses Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start your learning journey by enrolling in a course!
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Browse Courses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Course Progress</CardTitle>
                <p className="text-sm text-gray-600">
                  Track your learning journey
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.length}
                </p>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter((e) => e.status === "COMPLETED").length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
                      enrollments.length
                  )}
                  %
                </p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Course Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {enrollment.course.instructor?.name}
                      </p>
                      {getStatusBadge(
                        enrollment.status,
                        enrollment.progress || 0
                      )}
                    </div>
                    <div className="text-right">
                      <div
                        className={`w-12 h-12 ${getProgressColor(
                          enrollment.progress || 0
                        )} rounded-lg flex items-center justify-center text-white font-bold`}
                      >
                        {enrollment.progress || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {enrollment.progress || 0}%
                      </span>
                    </div>
                    <Progress
                      value={enrollment.progress || 0}
                      className="h-2"
                    />
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {calculateTimeSpent(enrollment.timeSpent || 0)} spent
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {getEstimatedCompletion(
                          enrollment.progress || 0,
                          enrollment.timeSpent || 0
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Current Lesson */}
                  {enrollment.currentLesson && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Current Lesson
                      </p>
                      <p className="text-sm text-blue-700">
                        {enrollment.currentLesson}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {enrollment.status === "ACTIVE" && (
                        <Button
                          onClick={() => onContinueCourse(enrollment.course.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                    )}
                    <Button
                      onClick={() => onViewCourse(enrollment.course.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  </div>

                  {/* Certificates */}
                  {enrollment.certificates &&
                    enrollment.certificates.length > 0 && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {enrollment.certificates.length} certificate
                          {enrollment.certificates.length > 1 ? "s" : ""} earned
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-16 h-16 ${getProgressColor(
                        enrollment.progress || 0
                      )} rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {enrollment.progress || 0}%
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {enrollment.course.title}
                        </h3>
                        {getStatusBadge(
                          enrollment.status,
                          enrollment.progress || 0
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Instructor: {enrollment.course.instructor?.name}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {calculateTimeSpent(enrollment.timeSpent || 0)}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {getEstimatedCompletion(
                              enrollment.progress || 0,
                              enrollment.timeSpent || 0
                            )}
                          </span>
                        </span>
                        {enrollment.certificates &&
                          enrollment.certificates.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span>
                                {enrollment.certificates.length} certificate
                                {enrollment.certificates.length > 1 ? "s" : ""}
                              </span>
                            </span>
                          )}
                      </div>

                      <Progress
                        value={enrollment.progress || 0}
                        className="mb-3"
                      />

                      {enrollment.currentLesson && (
                        <p className="text-sm text-blue-600 mb-3">
                          Current: {enrollment.currentLesson}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      {enrollment.status === "ACTIVE" && (
                        <Button
                          onClick={() => onContinueCourse(enrollment.course.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      )}
                      <Button
                        onClick={() => onViewCourse(enrollment.course.id)}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
