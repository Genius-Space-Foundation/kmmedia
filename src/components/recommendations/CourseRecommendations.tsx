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
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating: number;
  reviewCount: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  prerequisites: string[];
  learningOutcomes: string[];
  matchScore?: number;
  matchReason?: string;
}

interface Recommendation {
  type: "skill_based" | "interest_based" | "trending" | "completion_based";
  title: string;
  description: string;
  courses: Course[];
}

interface CourseRecommendationsProps {
  userId: string;
  userProfile?: {
    interests: string[];
    skillLevel: string;
    goals: string[];
    experience: string;
  };
}

export default function CourseRecommendations({
  userId,
  userProfile,
}: CourseRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, userProfile]);

  const fetchRecommendations = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/student/recommendations/${userId}`
      );
      const result = await response.json();

      if (result.success) {
        setRecommendations(result.data.recommendations);
      } else {
        console.error("Failed to fetch recommendations:", result.message);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "skill_based":
        return "🎯";
      case "interest_based":
        return "❤️";
      case "trending":
        return "🔥";
      case "completion_based":
        return "📈";
      default:
        return "💡";
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "skill_based":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interest_based":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "trending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completion_based":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Finding Perfect Courses for You...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recommended Courses
          </h2>
          <p className="text-gray-600">
            Personalized suggestions based on your profile
          </p>
        </div>
        <Button variant="outline" onClick={fetchRecommendations}>
          Refresh Recommendations
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No recommendations available yet
            </h3>
            <p className="text-gray-600">
              Complete your profile or take some courses to get personalized
              recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">
                    {getRecommendationIcon(recommendation.type)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {recommendation.title}
                  </h3>
                  <p className="text-gray-600">{recommendation.description}</p>
                </div>
                <Badge className={getRecommendationColor(recommendation.type)}>
                  {recommendation.type.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendation.courses.map((course) => (
                  <Card
                    key={course.id}
                    className="group hover:shadow-xl transition-all duration-300 border-0 card-brand-subtle hover:scale-[1.02]"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className="mb-2 bg-blue-100 text-blue-800">
                            {course.category}
                          </Badge>
                          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {course.description}
                          </CardDescription>
                        </div>
                        {course.matchScore && (
                          <div className="ml-4 text-right">
                            <div className="text-sm font-bold text-green-600">
                              {course.matchScore}% match
                            </div>
                            <Progress
                              value={course.matchScore}
                              className="w-16 h-2 mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Course Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-500">👨‍🏫</span>
                          <span className="text-gray-600 truncate">
                            {course.instructor.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">⏱️</span>
                          <span className="text-gray-600">
                            {course.duration} weeks
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-500">🎓</span>
                          <span className="text-gray-600">
                            {course.mode.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500">💰</span>
                          <span className="text-gray-600">
                            ₵{course.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Difficulty and Rating */}
                      <div className="flex items-center justify-between">
                        <Badge
                          className={getDifficultyColor(course.difficulty)}
                        >
                          {course.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">
                            {course.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({course.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Match Reason */}
                      {course.matchReason && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">
                              Why recommended:
                            </span>{" "}
                            {course.matchReason}
                          </p>
                        </div>
                      )}

                      {/* Learning Outcomes Preview */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          You'll learn:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {course.learningOutcomes
                            .slice(0, 3)
                            .map((outcome, idx) => (
                              <li
                                key={idx}
                                className="flex items-start space-x-2"
                              >
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{outcome}</span>
                              </li>
                            ))}
                          {course.learningOutcomes.length > 3 && (
                            <li className="text-blue-600 font-medium">
                              +{course.learningOutcomes.length - 3} more
                              outcomes
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Prerequisites */}
                      {course.prerequisites.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Prerequisites:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites
                              .slice(0, 3)
                              .map((prereq, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {prereq}
                                </Badge>
                              ))}
                            {course.prerequisites.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{course.prerequisites.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 btn-brand-professional font-semibold py-2 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                          onClick={() => {
                            // Handle course application
                            console.log("Apply for course:", course.id);
                          }}
                        >
                          Apply Now
                        </Button>
                        <Button
                          variant="outline"
                          className="px-4 py-2 rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                          onClick={() => {
                            // Handle course details view
                            console.log("View course details:", course.id);
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Completion Prompt */}
      {userProfile &&
        (!userProfile.interests.length || !userProfile.goals.length) && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Better Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                Complete your profile to receive more personalized course
                recommendations.
              </p>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}


