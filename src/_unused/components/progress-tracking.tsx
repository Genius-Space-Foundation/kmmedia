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

interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    duration: number;
    instructor: {
      name: string;
    };
  };
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
  certificates: any[];
  assessments: {
    id: string;
    title: string;
    score?: number;
    maxScore: number;
    status: "PENDING" | "COMPLETED" | "FAILED";
    dueDate?: string;
  }[];
}

interface ProgressTrackingProps {
  enrollments: Enrollment[];
  onContinueCourse: (courseId: string) => void;
  onViewCertificate: (certificateId: string) => void;
}

export default function ProgressTracking({
  enrollments,
  onContinueCourse,
  onViewCertificate,
}: ProgressTrackingProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100
  ).length;
  const totalCertificates = enrollments.reduce(
    (sum, e) => sum + e.certificates.length,
    0
  );
  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progress, 0) /
            enrollments.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedCourses}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressCourses}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalCertificates}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Your learning journey overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Progress</span>
                <span className="text-sm text-gray-600">
                  {averageProgress}%
                </span>
              </div>
              <Progress value={averageProgress} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {completedCourses}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {inProgressCourses}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {totalCourses - completedCourses - inProgressCourses}
                </div>
                <div className="text-sm text-gray-600">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>Track your progress in each course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{enrollment.course.title}</h4>
                    <p className="text-sm text-gray-600">
                      by {enrollment.course.instructor.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {enrollment.completedLessons}/{enrollment.totalLessons}{" "}
                      lessons
                    </div>
                    <div className="text-sm text-gray-600">
                      {enrollment.progress}% complete
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <Progress
                    value={enrollment.progress}
                    className={`h-2 ${getProgressColor(enrollment.progress)}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {enrollment.certificates.length > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        {enrollment.certificates.length} Certificate
                        {enrollment.certificates.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Badge
                      className={
                        enrollment.progress === 100
                          ? "bg-green-100 text-green-800"
                          : enrollment.progress > 0
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {enrollment.progress === 100
                        ? "Completed"
                        : enrollment.progress > 0
                        ? "In Progress"
                        : "Not Started"}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    {enrollment.progress < 100 && (
                      <Button
                        size="sm"
                        onClick={() => onContinueCourse(enrollment.course.id)}
                      >
                        Continue
                      </Button>
                    )}
                    {enrollment.certificates.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onViewCertificate(enrollment.certificates[0].id)
                        }
                      >
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>

                {/* Assessments */}
                {enrollment.assessments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-medium mb-2">Assessments</h5>
                    <div className="space-y-2">
                      {enrollment.assessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="text-sm font-medium">
                              {assessment.title}
                            </span>
                            {assessment.score !== undefined && (
                              <span className="text-sm text-gray-600 ml-2">
                                ({assessment.score}/{assessment.maxScore})
                              </span>
                            )}
                          </div>
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {enrollments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No enrollments found. Start by applying to a course!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificates */}
      {totalCertificates > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
            <CardDescription>Your earned certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment) =>
                enrollment.certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{enrollment.course.title}</h4>
                      <Badge className="bg-green-100 text-green-800">
                        Certificate
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Issued on{" "}
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewCertificate(certificate.id)}
                      className="w-full"
                    >
                      View Certificate
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
