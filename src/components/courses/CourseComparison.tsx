"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  Users,
  Star,
  DollarSign,
  BookOpen,
  Award,
  X,
  GitCompare,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: string;
  instructor: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  _count: {
    applications: number;
    enrollments: number;
  };
  averageRating?: number;
  totalReviews?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  certificateAwarded?: boolean;
  nextStartDate?: string;
  spotsRemaining?: number;
}

interface CourseComparisonProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onClearAll: () => void;
  trigger?: React.ReactNode;
}

export default function CourseComparison({
  courses,
  onRemoveCourse,
  onClearAll,
  trigger,
}: CourseComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (courses.length === 0) {
    return null;
  }

  const comparisonData = [
    {
      label: "Price",
      key: "price",
      render: (course: Course) => `₵${course.price.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Application Fee",
      key: "applicationFee",
      render: (course: Course) => `₵${course.applicationFee.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Duration",
      key: "duration",
      render: (course: Course) => `${course.duration} weeks`,
      icon: Clock,
    },
    {
      label: "Difficulty",
      key: "difficulty",
      render: (course: Course) => course.difficulty,
      icon: Award,
    },
    {
      label: "Mode",
      key: "mode",
      render: (course: Course) => course.mode.join(", "),
      icon: MapPin,
    },
    {
      label: "Category",
      key: "category",
      render: (course: Course) => course.category,
      icon: BookOpen,
    },
    {
      label: "Instructor",
      key: "instructor",
      render: (course: Course) => course.instructor.name,
      icon: User,
    },
    {
      label: "Students Enrolled",
      key: "enrollments",
      render: (course: Course) => course._count.enrollments.toString(),
      icon: Users,
    },
    {
      label: "Rating",
      key: "rating",
      render: (course: Course) => {
        const rating = course.averageRating || 4.8;
        const reviews = course.totalReviews || course._count.enrollments;
        return `${rating.toFixed(1)} (${reviews} reviews)`;
      },
      icon: Star,
    },
    {
      label: "Certificate",
      key: "certificate",
      render: (course: Course) =>
        course.certificateAwarded !== false ? "Yes" : "No",
      icon: Award,
    },
    {
      label: "Next Start Date",
      key: "startDate",
      render: (course: Course) =>
        course.nextStartDate
          ? new Date(course.nextStartDate).toLocaleDateString()
          : "Flexible",
      icon: Calendar,
    },
    {
      label: "Spots Remaining",
      key: "spots",
      render: (course: Course) =>
        course.spotsRemaining ? course.spotsRemaining.toString() : "Available",
      icon: Users,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare Courses ({courses.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Course Comparison
              </DialogTitle>
              <DialogDescription>
                Compare {courses.length} courses side by side to make the best
                choice
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Headers */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${courses.length}, 1fr)`,
            }}
          >
            <div></div>
            {courses.map((course) => (
              <Card key={course.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCourse(course.id)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-3 h-3" />
                </Button>
                <CardHeader className="pb-3">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src="/images/3.jpeg"
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-48 font-semibold">Feature</TableHead>
                  {courses.map((course) => (
                    <TableHead
                      key={course.id}
                      className="text-center font-semibold"
                    >
                      Course {courses.indexOf(course) + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TableRow key={item.key} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span>{item.label}</span>
                        </div>
                      </TableCell>
                      {courses.map((course) => (
                        <TableCell key={course.id} className="text-center">
                          {item.render(course)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {/* Prerequisites */}
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span>Prerequisites</span>
                    </div>
                  </TableCell>
                  {courses.map((course) => (
                    <TableCell key={course.id} className="text-center">
                      {course.prerequisites &&
                      course.prerequisites.length > 0 ? (
                        <div className="space-y-1">
                          {course.prerequisites
                            .slice(0, 2)
                            .map((prereq, index) => (
                              <div
                                key={index}
                                className="text-xs bg-gray-100 rounded px-2 py-1"
                              >
                                {prereq}
                              </div>
                            ))}
                          {course.prerequisites.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{course.prerequisites.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Learning Objectives */}
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span>Learning Objectives</span>
                    </div>
                  </TableCell>
                  {courses.map((course) => (
                    <TableCell key={course.id} className="text-center">
                      {course.learningObjectives &&
                      course.learningObjectives.length > 0 ? (
                        <div className="space-y-1">
                          {course.learningObjectives
                            .slice(0, 3)
                            .map((objective, index) => (
                              <div
                                key={index}
                                className="text-xs text-left bg-blue-50 rounded px-2 py-1"
                              >
                                • {objective}
                              </div>
                            ))}
                          {course.learningObjectives.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{course.learningObjectives.length - 3} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Not specified</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Action Buttons */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${courses.length}, 1fr)`,
            }}
          >
            <div></div>
            {courses.map((course) => (
              <div key={course.id} className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <a
                    href={`/courses/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Details
                  </a>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <a
                    href={`/courses/${course.id}/apply`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now
                  </a>
                </Button>
              </div>
            ))}
          </div>

          {/* Comparison Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">
                Quick Comparison Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-blue-900 mb-2">
                    Most Affordable
                  </div>
                  {(() => {
                    const cheapest = courses.reduce((prev, current) =>
                      prev.price < current.price ? prev : current
                    );
                    return (
                      <div className="text-blue-800">
                        {cheapest.title} - ₵{cheapest.price.toLocaleString()}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <div className="font-semibold text-blue-900 mb-2">
                    Shortest Duration
                  </div>
                  {(() => {
                    const shortest = courses.reduce((prev, current) =>
                      prev.duration < current.duration ? prev : current
                    );
                    return (
                      <div className="text-blue-800">
                        {shortest.title} - {shortest.duration} weeks
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <div className="font-semibold text-blue-900 mb-2">
                    Most Popular
                  </div>
                  {(() => {
                    const popular = courses.reduce((prev, current) =>
                      prev._count.enrollments > current._count.enrollments
                        ? prev
                        : current
                    );
                    return (
                      <div className="text-blue-800">
                        {popular.title} - {popular._count.enrollments} students
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
