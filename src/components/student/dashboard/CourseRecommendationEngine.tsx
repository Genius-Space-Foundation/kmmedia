"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Star, Clock, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number;
  price: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviewCount?: number;
}

interface LearningProfile {
  interests: string[];
  goals: string[];
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  preferredLearningStyle?: string;
  weeklyGoal?: {
    target: number;
    unit: string;
  };
}

interface CourseRecommendation {
  courseId: string;
  course: Course;
  relevanceScore: number;
  reason: string;
  matchedInterests: string[];
  matchedSkills: string[];
  dismissedAt?: Date;
}

interface CourseRecommendationEngineProps {
  userId: string;
  userProfile: LearningProfile;
  onApplyCourse: (courseId: string) => void;
  onDismissRecommendation: (courseId: string) => void;
}

export default function CourseRecommendationEngine({
  userId,
  userProfile,
  onApplyCourse,
  onDismissRecommendation,
}: CourseRecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/recommendations?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (courseId: string) => {
    try {
      await onDismissRecommendation(courseId);
      setRecommendations(prev => 
        prev.filter(rec => rec.courseId !== courseId)
      );
    } catch (error) {
      console.error("Error dismissing recommendation:", error);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = categoryFilter === "all" || rec.course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || rec.course.difficulty === difficultyFilter;
    
    let matchesTime = true;
    if (timeFilter !== "all") {
      const duration = rec.course.duration;
      if (timeFilter === "short") matchesTime = duration <= 4;
      else if (timeFilter === "medium") matchesTime = duration > 4 && duration <= 8;
      else if (timeFilter === "long") matchesTime = duration > 8;
    }
    
    return matchesCategory && matchesDifficulty && matchesTime;
  });

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

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading recommendations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended Courses
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchRecommendations}>
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
              <SelectItem value="VIDEOGRAPHY">Videography</SelectItem>
              <SelectItem value="EDITING">Editing</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time Commitment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Duration</SelectItem>
              <SelectItem value="short">Short (≤4 weeks)</SelectItem>
              <SelectItem value="medium">Medium (5-8 weeks)</SelectItem>
              <SelectItem value="long">Long ({'>'}8 weeks)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No recommendations available</p>
            <p className="text-sm text-gray-400 mt-1">
              {recommendations.length === 0
                ? "Complete your learning profile to get personalized recommendations"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation.courseId}
                className="relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  onClick={() => handleDismiss(recommendation.courseId)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Relevance Score */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold",
                      getRelevanceColor(recommendation.relevanceScore)
                    )}
                  >
                    {recommendation.relevanceScore}% Match
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getDifficultyColor(recommendation.course.difficulty)}
                  >
                    {recommendation.course.difficulty}
                  </Badge>
                </div>

                {/* Course Info */}
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {recommendation.course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {recommendation.course.description}
                </p>

                {/* Recommendation Reason */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Why this course: </span>
                    {recommendation.reason}
                  </p>
                </div>

                {/* Matched Interests */}
                {recommendation.matchedInterests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Matches your interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.matchedInterests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{recommendation.course.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">👨‍🏫</span>
                    <span className="text-gray-600">{recommendation.course.instructor.name}</span>
                  </div>
                  {recommendation.course.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-600">
                        {recommendation.course.rating} ({recommendation.course.reviewCount})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">💰</span>
                    <span className="text-gray-600">₵{recommendation.course.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onApplyCourse(recommendation.courseId)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
