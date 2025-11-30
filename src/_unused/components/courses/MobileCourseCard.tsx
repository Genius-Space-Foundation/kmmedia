/**
 * Mobile-Optimized Course Card Component
 * Provides touch-friendly course cards with improved mobile layout
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  Heart,
  Share2,
  Eye,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  StarHalf,
  GraduationCap,
  BarChart3,
  ChevronRight,
  MapPin,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isTouchDevice, getTouchTargetSize } from "@/lib/mobile-utils";

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
    bio?: string;
    rating?: number;
    totalStudents?: number;
    yearsExperience?: number;
    credentials?: string[];
  };
  _count: {
    applications: number;
    enrollments: number;
    reviews?: number;
  };
  status: string;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
  isEnrolled?: boolean;
  progress?: number;
  isWishlisted?: boolean;
  nextStartDate?: string;
  spotsRemaining?: number;
  tags?: string[];
  completionRate?: number;
  lastAccessed?: string;
}

interface MobileCourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "list";
  showProgress?: boolean;
  onWishlistToggle?: (courseId: string) => void;
  onShare?: (course: Course) => void;
  onPreview?: (course: Course) => void;
  onCompare?: (course: Course) => void;
  className?: string;
  isInComparison?: boolean;
}

export default function MobileCourseCard({
  course,
  variant = "default",
  showProgress = false,
  onWishlistToggle,
  onShare,
  onPreview,
  onCompare,
  className = "",
  isInComparison = false,
}: MobileCourseCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rating = course.averageRating || 4.8;
  const reviewCount =
    course.totalReviews || course._count.reviews || course._count.enrollments;
  const isPopular = course._count.enrollments > 50;
  const isAlmostFull = course.spotsRemaining && course.spotsRemaining <= 5;
  const isNew =
    new Date(course.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleTouchStart = () => {
    if (isTouchDevice()) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (isTouchDevice()) {
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(course.id);

    // Haptic feedback on supported devices
    if ("vibrate" in navigator && isTouchDevice()) {
      navigator.vibrate(10);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(course);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPreview?.(course);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompare?.(course);
  };

  // List variant for mobile filtering results
  if (variant === "list") {
    return (
      <Card
        className={cn(
          "mobile-card hover-mobile focus-mobile transition-all duration-200",
          isPressed && "scale-98",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex p-4 space-x-4">
          {/* Course Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="/images/3.jpeg"
                alt={course.title}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <BookOpen className="w-8 h-8 text-blue-500" />}
            </div>

            {/* Status Badges */}
            <div className="absolute -top-1 -right-1 flex flex-col space-y-1">
              {isNew && (
                <Badge className="bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                  ✨
                </Badge>
              )}
              {isPopular && (
                <Badge className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full">
                  🔥
                </Badge>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 pr-2">
                {course.title}
              </h3>

              {/* Mobile Action Buttons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={handleWishlistToggle}
                  className="btn-touch-friendly-sm p-1 rounded-lg hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
                  aria-label={
                    course.isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      course.isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    )}
                  />
                </button>

                {onCompare && (
                  <button
                    onClick={handleCompare}
                    className={cn(
                      "btn-touch-friendly-sm p-1 rounded-lg hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1",
                      isInComparison && "bg-blue-100 text-blue-600"
                    )}
                    aria-label={
                      isInComparison
                        ? "Remove from comparison"
                        : "Add to comparison"
                    }
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Instructor and Rating */}
            <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <Avatar className="w-4 h-4">
                  <AvatarImage
                    src={course.instructor.profileImage}
                    alt={course.instructor.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {course.instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium max-w-20">
                  {course.instructor.name}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{course.duration}w</span>
              </div>
            </div>

            {/* Price and Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {course.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0.5",
                    course.difficulty === "Beginner" &&
                      "border-green-200 text-green-700",
                    course.difficulty === "Intermediate" &&
                      "border-yellow-200 text-yellow-700",
                    course.difficulty === "Advanced" &&
                      "border-red-200 text-red-700"
                  )}
                >
                  {course.difficulty}
                </Badge>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900 text-sm">
                  ₵{course.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress for enrolled courses */}
            {showProgress && course.isEnrolled && (
              <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3 text-green-600" />
                    <span className="font-medium">Progress</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {course.progress || 0}%
                  </span>
                </div>
                <Progress
                  value={course.progress || 0}
                  className="h-2 bg-green-100"
                />
              </div>
            )}
          </div>

          {/* Chevron for navigation hint */}
          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>Mobile Course Card - Compact and Default variants coming soon</div>
  );
}
  // Co