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
  MapPin,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  StarHalf,
  GraduationCap,
  BarChart3,
  FileText,
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
    assignments?: number;
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

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "detailed";
  showProgress?: boolean;
  onWishlistToggle?: (courseId: string) => void;
  onShare?: (course: Course) => void;
  onPreview?: (course: Course) => void;
  className?: string;
}

export default function CourseCard({
  course,
  variant = "default",
  showProgress = false,
  onWishlistToggle,
  onShare,
  onPreview,
  className = "",
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rating = course.averageRating || 4.8;
  const reviewCount =
    course.totalReviews || course._count.reviews || course._count.enrollments;
  const isPopular = course._count.enrollments > 50;
  const isAlmostFull = course.spotsRemaining && course.spotsRemaining <= 5;
  const isNew =
    new Date(course.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(course.id);
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

  if (variant === "compact") {
    return (
      <Card
        className={`group hover:shadow-lg transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            {isPopular && (
              <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 py-0.5">
                🔥
              </Badge>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-brand-primary transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      course.isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <Avatar className="w-4 h-4">
                  <AvatarImage
                    src={course.instructor.profileImage}
                    alt={course.instructor.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-brand-primary text-white text-xs">
                    {course.instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">
                  {course.instructor.name}
                </span>
                {course.instructor.rating && (
                  <div className="flex items-center space-x-0.5">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">
                      {course.instructor.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{course.duration}w</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {course.difficulty}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  ₵{course.price.toLocaleString()}
                </div>
              </div>
            </div>

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
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm hover:scale-[1.03] hover:-translate-y-2 relative overflow-hidden cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1">
        {isNew && (
          <Badge className="bg-green-500 text-white text-xs px-2 py-1">
            ✨ New
          </Badge>
        )}
        {isPopular && (
          <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
            🔥 Popular
          </Badge>
        )}
        {isAlmostFull && (
          <Badge className="bg-red-500 text-white text-xs px-2 py-1">
            ⚡ Almost Full
          </Badge>
        )}
        {course.isEnrolled && (
          <Badge className="bg-brand-primary text-white text-xs px-2 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enrolled
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Heart
            className={`w-4 h-4 ${
              course.isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Share2 className="w-4 h-4 text-gray-600" />
        </Button>
        {onPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Button>
        )}
      </div>

      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src="/images/3.jpeg"
          alt={course.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Animated overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-full group-hover:translate-x-0" />

        {/* Play Button Overlay */}
        {onPreview && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePreview}
              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </Button>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
          <div className="text-lg font-bold text-gray-900">
            ₵{course.price.toLocaleString()}
          </div>
          {course.applicationFee > 0 && (
            <div className="text-xs text-gray-600">
              App: ₵{course.applicationFee.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        {/* Category and Difficulty Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="bg-brand-primary-light text-brand-primary border-brand-primary">
            {course.category}
          </Badge>
          <Badge variant="outline" className="border-green-200 text-green-800">
            {course.difficulty}
          </Badge>
          {course.mode.map((mode) => (
            <Badge key={mode} variant="outline" className="text-xs">
              {mode}
            </Badge>
          ))}
        </div>

        <CardTitle className="text-xl text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2 mb-2">
          {course.title}
        </CardTitle>

        <CardDescription className="text-gray-600 line-clamp-2 mb-4">
          {course.description}
        </CardDescription>

        {/* Enhanced Instructor Info */}
        <div className="bg-gradient-to-r from-brand-primary-light/30 to-brand-primary-light/50 rounded-lg p-4 mb-4 border border-brand-primary-light">
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
              <AvatarImage
                src={course.instructor.profileImage}
                alt={course.instructor.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-semibold">
                {course.instructor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">
                  {course.instructor.name}
                </h4>
                <GraduationCap className="w-4 h-4 text-brand-primary" />
              </div>

              {/* Instructor Rating */}
              {course.instructor.rating && (
                <div className="flex items-center space-x-1 mb-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => {
                      const rating = course.instructor.rating || 0;
                      if (i < Math.floor(rating)) {
                        return (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        );
                      } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                        return (
                          <StarHalf
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        );
                      } else {
                        return (
                          <Star key={i} className="w-3 h-3 text-gray-300" />
                        );
                      }
                    })}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {course.instructor.rating.toFixed(1)} instructor rating
                  </span>
                </div>
              )}

              {/* Instructor Stats */}
              <div className="flex items-center space-x-3 text-xs text-gray-600">
                {course.instructor.totalStudents && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>
                      {course.instructor.totalStudents.toLocaleString()}{" "}
                      students
                    </span>
                  </div>
                )}
                {course.instructor.yearsExperience && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>{course.instructor.yearsExperience}+ years exp</span>
                  </div>
                )}
              </div>

              {/* Instructor Credentials */}
              {course.instructor.credentials &&
                course.instructor.credentials.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.instructor.credentials
                      .slice(0, 2)
                      .map((credential) => (
                        <Badge
                          key={credential}
                          variant="secondary"
                          className="text-xs bg-brand-primary-light text-brand-primary border-brand-primary"
                        >
                          {credential}
                        </Badge>
                      ))}
                    {course.instructor.credentials.length > 2 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        +{course.instructor.credentials.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Enhanced Course Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-4 bg-gradient-to-r from-gray-50 to-brand-primary-light/30 rounded-lg border border-gray-100 group-hover:border-brand-primary-light transition-colors duration-300">
          <div className="text-center group/stat">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300 shadow-sm">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">
              {rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 font-medium">Rating</div>
          </div>
          <div className="text-center group/stat">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300 shadow-sm">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">
              {course._count.enrollments}
            </div>
            <div className="text-xs text-gray-600 font-medium">Students</div>
          </div>
          <div className="text-center group/stat">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300 shadow-sm">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">
              {course._count.assignments || 0}
            </div>
            <div className="text-xs text-gray-600 font-medium">Assignments</div>
          </div>
          <div className="text-center group/stat">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-brand-primary-light to-brand-primary-light rounded-lg mx-auto mb-1 group-hover/stat:scale-110 transition-transform duration-300 shadow-sm">
              <Clock className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">
              {course.duration}
            </div>
            <div className="text-xs text-gray-600 font-medium">Weeks</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Enhanced Progress Indicators for Enrolled Students */}
        {showProgress && course.isEnrolled && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">Your Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">
                  {course.progress || 0}%
                </span>
                <div className="text-xs text-gray-600">complete</div>
              </div>
            </div>

            <Progress
              value={course.progress || 0}
              className="h-3 mb-3 bg-green-100"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last accessed:</span>
                <span className="font-medium text-gray-900">
                  {course.lastAccessed
                    ? new Date(course.lastAccessed).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completion rate:</span>
                <span className="font-medium text-gray-900">
                  {course.completionRate || 85}%
                </span>
              </div>
            </div>

            {/* Progress Status Badge */}
            <div className="mt-3 flex justify-center">
              {(course.progress || 0) === 100 ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : (course.progress || 0) > 50 ? (
                <Badge className="bg-brand-primary text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              ) : (
                <Badge className="bg-orange-500 text-white">
                  <Play className="w-3 h-3 mr-1" />
                  Just Started
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {course.nextStartDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                Next start:{" "}
                {new Date(course.nextStartDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {course.spotsRemaining && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>{course.spotsRemaining} spots remaining</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Certificate included</span>
          </div>
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="flex gap-3">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full btn-brand-outline font-semibold group/btn"
            >
              <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
              View Details
            </Button>
          </Link>
          <Link href={`/courses/${course.id}/apply`} className="flex-1">
            <Button className="w-full btn-brand-primary font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.05] transition-all duration-300 group/btn">
              {course.isEnrolled ? (
                <>
                  <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                  Continue Learning
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                  Apply Now
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
