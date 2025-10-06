"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Star,
  Award,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Globe,
  GraduationCap,
  TrendingUp,
  Shield,
  Heart,
  Play,
  Download,
  Share2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
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
    profile?: {
      bio?: string;
    };
  };
  lessons?: Array<{
    id: string;
    title: string;
    description?: string;
    order: number;
  }>;
  _count: {
    applications: number;
    enrollments: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const token = localStorage.getItem("accessToken");
        setIsAuthenticated(!!token);

        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.message || "Failed to fetch course");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Loading Course Details...
          </div>
          <p className="text-gray-500">
            Please wait while we fetch course information
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Error Loading Course
            </CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Please try again or browse our available courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Try Again
                </Button>
                <Link href="/courses" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Course Not Found
            </CardTitle>
            <CardDescription className="text-gray-600">
              The course you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Please check the course ID or browse our available courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/courses" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Browse Courses
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate spots remaining (assuming a default capacity if not provided)
  const capacity = 30; // Default capacity, you might want to add this to your course model
  const enrolled = course._count.enrollments || 0;
  const spotsRemaining = capacity - enrolled;
  const isAlmostFull = spotsRemaining <= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              {/* Logo Section */}
              <Link
                href="/"
                className="flex items-center space-x-3 flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                  <img
                    src="/images/logo.jpeg"
                    alt="KM Media Training Institute"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    KM Media Training Institute
                  </h1>
                  <p className="text-sm text-gray-600">
                    Excellence in Media Education
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    About
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Courses
                  </Button>
                </Link>
                <Link href="/stories">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Stories
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Contact
                  </Button>
                </Link>
              </div>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                    Sign Up
                  </Button>
                </Link>
              </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-blue-50 p-2 ml-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </Button>
              </div>
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    About
                  </Button>
                </Link>
                <Link
                  href="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    Courses
                  </Button>
                </Link>
                <Link
                  href="/stories"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    Stories
                  </Button>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    Contact
                  </Button>
                </Link>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="py-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link
              href="/courses"
              className="hover:text-blue-600 transition-colors"
            >
              Courses
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-none">
              {course.title}
            </span>
          </div>
        </nav>

        {/* Modern Hero Section */}
        <section className="pb-12">
          <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl bg-white border border-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>

            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Content */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {course.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 text-green-800"
                      >
                        {course.difficulty}
                      </Badge>
                      {isAlmostFull && (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-600 border-red-200"
                        >
                          🔥 Almost Full
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                      {course.title}
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-4 py-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mx-auto mb-2">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          4.8
                        </div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mx-auto mb-2">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {enrolled}
                        </div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mx-auto mb-2">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {course.duration}
                        </div>
                        <div className="text-sm text-gray-600">Weeks</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Course Image */}
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="/images/3.jpeg"
                        alt={course.title}
                        className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          ₵{course.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Application: ₵{course.applicationFee.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {course.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-800"
                    >
                      {course.difficulty}
                    </Badge>
                    {isAlmostFull && (
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-600 border-red-200"
                      >
                        🔥 Almost Full
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Enhanced Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl border border-blue-100">
                  <div className="text-center group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      4.8
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      Rating
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {enrolled}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      Enrolled
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {course.duration}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      Weeks
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {spotsRemaining}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      Spots Left
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Course Description */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-gray-900">
                    About This Course
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6 sm:mb-8">
                  {course.longDescription || course.description}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Course Details
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700 font-medium">
                          Duration: {course.duration} weeks
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <Award className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          Level: {course.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <span className="text-gray-700 font-medium">
                          Mode: {course.mode.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                        <GraduationCap className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700 font-medium">
                          Category: {course.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Enrollment Info
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span className="text-gray-700 font-medium">
                          Applications: {course._count.applications}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-gray-700 font-medium">
                          Enrolled: {enrolled}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                        <Shield className="w-5 h-5 text-yellow-600" />
                        <span className="text-gray-700 font-medium">
                          Status: {course.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                        <Heart className="w-5 h-5 text-red-600" />
                        <span className="text-gray-700 font-medium">
                          Spots Available: {spotsRemaining}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl text-gray-900">
                      Course Curriculum
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Detailed breakdown of course content and lessons
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="group bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                            {lesson.order}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {lesson.title}
                            </h4>
                            {lesson.description && (
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-500 font-medium">
                                Lesson {lesson.order}
                              </span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">
                        No lessons available yet.
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Curriculum will be updated soon.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">
                    Meet Your Instructor
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                    {/* Instructor Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </div>
                    </div>

                    {/* Instructor Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                        {course.instructor.name}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        {course.instructor.profile?.bio ||
                          "Experienced instructor with expertise in this field. Dedicated to providing quality education and mentoring students to achieve their goals."}
                      </p>

                      {/* Instructor Badges */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs sm:text-sm">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">
                            Verified Instructor
                          </span>
                          <span className="sm:hidden">Verified</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-800 text-xs sm:text-sm"
                        >
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Expert Level</span>
                          <span className="sm:hidden">Expert</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-purple-200 text-purple-800 text-xs sm:text-sm"
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Highly Rated</span>
                          <span className="sm:hidden">Rated</span>
                        </Badge>
                      </div>

                      {/* Contact Information */}
                      <div className="p-3 sm:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-emerald-200">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Contact:</span>
                          <span className="text-blue-600 break-all sm:break-normal">
                            {course.instructor.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Modern Application Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl sticky top-24">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    ₵{course.price.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Application Fee: ₵{course.applicationFee.toLocaleString()}
                  </div>
                  {isAlmostFull && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <p className="text-red-800 text-xs sm:text-sm font-medium">
                          Only {spotsRemaining} spots remaining!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        Duration:
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {course.duration} weeks
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 font-medium">Mode:</span>
                    </div>
                    <div className="flex gap-1">
                      {course.mode.map((mode, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          {mode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700 font-medium">Level:</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-700 font-medium">Status:</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-700 font-medium">
                        Enrolled:
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {enrolled} students
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="space-y-4">
                  {isAuthenticated ? (
                    <Link href={`/courses/${course.id}/apply`}>
                      <Button className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Apply Now
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/auth/login?returnUrl=${encodeURIComponent(
                        `/courses/${course.id}/apply`
                      )}`}
                    >
                      <Button className="w-full h-12 sm:h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Login to Apply
                      </Button>
                    </Link>
                  )}
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
                    {isAuthenticated
                      ? "Secure your spot with application fee payment"
                      : "You need to be logged in to apply for this course"}
                  </p>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Need Help?</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Have questions about this course? Our admissions team is
                    here to help.
                  </p>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Contact Admissions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Course Features */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">
                    Course Features
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Duration: {course.duration} weeks
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Level: {course.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Mode: {course.mode.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                    <GraduationCap className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Category: {course.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Applications: {course._count.applications}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      Enrolled: {enrolled}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-12 bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-t-3xl">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img
                  src="/images/logo.jpeg"
                  alt="KM Media Training Institute Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  KM Media Training Institute
                </h3>
                <p className="text-gray-400 text-sm">
                  Excellence in Media Education
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Empowering the next generation of media professionals through
              innovative hybrid learning experiences.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Link
                href="/about"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/courses"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/stories"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Stories
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="pt-6 border-t border-gray-700">
              <p className="text-gray-400">
                &copy; 2025 KM Media Training Institute. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
