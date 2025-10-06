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

interface StudentProgressTrackingProps {
  enrollments: Enrollment[];
  onContinueCourse: (courseId: string) => void;
  onViewCertificate: (certificateId: string) => void;
}

export default function StudentProgressTracking({
  enrollments,
  onContinueCourse,
  onViewCertificate,
}: StudentProgressTrackingProps) {
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
    (sum, e) => sum + (e.certificates?.length || 0),
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Learning Progress</h2>
      </div>

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {enrollment.course.title}
                  </CardTitle>
                  <CardDescription>
                    by {enrollment.course.instructor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress
                        value={enrollment.progress}
                        className={`h-2 ${getProgressColor(
                          enrollment.progress
                        )}`}
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      {enrollment.completedLessons}/{enrollment.totalLessons}{" "}
                      lessons completed
                    </div>

                    <div className="flex items-center justify-between">
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

                      {(enrollment.certificates?.length || 0) > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          {enrollment.certificates?.length || 0} Certificate
                          {(enrollment.certificates?.length || 0) > 1
                            ? "s"
                            : ""}
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {enrollment.progress < 100 && (
                        <Button
                          size="sm"
                          onClick={() => onContinueCourse(enrollment.course.id)}
                          className="flex-1"
                        >
                          Continue
                        </Button>
                      )}
                      {(enrollment.certificates?.length || 0) > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onViewCertificate(enrollment.certificates[0].id)
                          }
                          className="flex-1"
                        >
                          View Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">
                            {enrollment.course.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            by {enrollment.course.instructor.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Last accessed:{" "}
                            {new Date(
                              enrollment.lastAccessed
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {enrollment.completedLessons}/
                          {enrollment.totalLessons} lessons
                        </div>
                        <div className="text-sm text-gray-600">
                          {enrollment.progress}% complete
                        </div>
                        <div className="mt-2">
                          <Progress
                            value={enrollment.progress}
                            className={`h-2 ${getProgressColor(
                              enrollment.progress
                            )}`}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {enrollment.progress < 100 && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onContinueCourse(enrollment.course.id)
                            }
                          >
                            Continue
                          </Button>
                        )}
                        {(enrollment.certificates?.length || 0) > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onViewCertificate(enrollment.certificates[0].id)
                            }
                          >
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments
              .filter((e) => (e.certificates?.length || 0) > 0)
              .map((enrollment) =>
                (enrollment.certificates || []).map((certificate) => (
                  <Card
                    key={certificate.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Certificate of Completion
                      </CardTitle>
                      <CardDescription>
                        {enrollment.course.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Issued:{" "}
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Instructor: {enrollment.course.instructor.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {enrollment.course.duration} weeks
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          className="w-full"
                          onClick={() => onViewCertificate(certificate.id)}
                        >
                          View Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            {enrollments.filter((e) => (e.certificates?.length || 0) > 0)
              .length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No certificates earned yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
