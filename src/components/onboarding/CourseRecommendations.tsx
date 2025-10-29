"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  price: number;
  instructor: {
    id: string;
    name: string;
    profileImage?: string;
  };
  enrollmentCount: number;
  reviewCount: number;
  matchReason: string;
}

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function CourseRecommendations({
  recommendations,
  onComplete,
  onSkip,
}: CourseRecommendationsProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const router = useRouter();

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleEnrollSelected = () => {
    if (selectedCourses.length > 0) {
      // Navigate to enrollment flow with selected courses
      const courseIds = selectedCourses.join(",");
      router.push(`/courses/enroll?courses=${courseIds}`);
    } else {
      onComplete();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  if (recommendations.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to KM Media!</CardTitle>
          <CardDescription>
            We're still building your personalized recommendations. You can
            explore our course catalog to find courses that interest you.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <Button onClick={() => router.push("/courses")} className="mr-4">
                Browse Courses
              </Button>
              <Button variant="outline" onClick={onComplete}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Recommended Courses for You</CardTitle>
        <CardDescription>
          Based on your interests and goals, we've found these courses that
          might be perfect for you. Select any courses you'd like to explore
          further.
        </CardDescription>

        {selectedCourses.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {selectedCourses.length} course
              {selectedCourses.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((course) => (
            <div
              key={course.id}
              className={`relative border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                selectedCourses.includes(course.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleCourseSelection(course.id)}
            >
              {/* Selection indicator */}
              <div className="absolute top-3 right-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedCourses.includes(course.id)
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedCourses.includes(course.id) && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Course title and category */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.category}
                  </p>
                </div>

                {/* Course description */}
                <p className="text-sm text-gray-700 line-clamp-3">
                  {course.description}
                </p>

                {/* Course metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <Badge variant="outline">{course.duration} weeks</Badge>
                  {course.enrollmentCount > 0 && (
                    <Badge variant="outline">
                      {course.enrollmentCount} students
                    </Badge>
                  )}
                </div>

                {/* Instructor */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {course.instructor.profileImage ? (
                      <img
                        src={course.instructor.profileImage}
                        alt={course.instructor.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {course.instructor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {course.instructor.name}
                  </span>
                </div>

                {/* Price and match reason */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-gray-900">
                    {formatPrice(course.price)}
                  </span>
                </div>

                {/* Match reason */}
                <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                  <span className="font-medium">Why this course: </span>
                  {course.matchReason}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={onSkip}>
            Skip for now
          </Button>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => router.push("/courses")}>
              Browse All Courses
            </Button>
            <Button onClick={handleEnrollSelected}>
              {selectedCourses.length > 0
                ? `Explore Selected (${selectedCourses.length})`
                : "Go to Dashboard"}
            </Button>
          </div>
        </div>

        {/* Incentive message */}
        {selectedCourses.length > 0 && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Pro tip:</strong> Starting with 1-2 courses helps you
              stay focused and complete them successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
