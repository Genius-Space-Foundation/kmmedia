"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  };
  _count: {
    applications: number;
    enrollments: number;
  };
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Memoize the courses to prevent unnecessary re-renders
  const memoizedCourses = useMemo(() => courses, [courses]);

  // Track previous state to reduce console.log frequency
  const prevStateRef = useRef({
    loading,
    error,
    coursesLength: courses.length,
  });

  const fetchCourses = useCallback(async (isMounted?: boolean) => {
    try {
      console.log("Starting to fetch courses...");
      setLoading(true);
      setError(null);

      const response = await fetch("/api/courses?status=PUBLISHED");
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      // Only update state if component is still mounted
      if (isMounted !== false) {
        if (data.success) {
          console.log("Setting courses:", data.data.courses);
          setCourses(data.data.courses);
        } else {
          console.log("API returned error:", data.message);
          setError(data.message || "Failed to fetch courses");
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (isMounted !== false) {
        setError(
          `Failed to fetch courses: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      if (isMounted !== false) {
        console.log("Setting loading to false");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await fetchCourses(isMounted);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchCourses]);

  // Only log when state actually changes
  const currentState = {
    loading,
    error,
    coursesLength: memoizedCourses.length,
  };
  const hasStateChanged =
    prevStateRef.current.loading !== loading ||
    prevStateRef.current.error !== error ||
    prevStateRef.current.coursesLength !== memoizedCourses.length;

  if (hasStateChanged) {
    console.log(
      "HomePage render - Loading:",
      loading,
      "Error:",
      error,
      "Courses:",
      memoizedCourses.length
    );
    prevStateRef.current = currentState;
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #3b82f6",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <p style={{ marginTop: "20px", color: "#333" }}>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fee",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h1 style={{ color: "#c00" }}>Error Loading Page</h1>
          <p style={{ color: "#333" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative max-w-8xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-responsive">
            <nav className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo Section - Left */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="/images/logo.jpeg"
                    alt="KM Media Training Institute Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                    KM Media Training Institute
                  </h1>
                  <p className="text-xs text-gray-600 font-medium">
                    Excellence in Media Education
                  </p>
                </div>
              </div>

              {/* Navigation Links - Center */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    About
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    variant="ghost"
                    className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Courses
                  </Button>
                </Link>
                <Link href="/stories">
                  <Button
                    variant="ghost"
                    className="hover:bg-green-50 hover:text-green-600 transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Stories
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="ghost"
                    className="hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Contact
                  </Button>
                </Link>
              </div>

              {/* Auth Buttons - Right */}
              <div className="flex items-center space-x-1 sm:space-x-3">
                <Link href="/auth/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="btn-touch-friendly-sm hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button className="btn-touch-friendly-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
                    Sign Up
                  </Button>
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden btn-touch-friendly-sm hover:bg-blue-50 p-2 ml-2"
                  onClick={toggleMobileMenu}
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200"
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
            <div className="mt-4 pb-4 border-t border-gray-200/50">
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/about" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                  >
                    About
                  </Button>
                </Link>
                <Link href="/courses" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                  >
                    Courses
                  </Button>
                </Link>
                <Link href="/stories" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                  >
                    Stories
                  </Button>
                </Link>
                <Link href="/contact" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                  >
                    Contact
                  </Button>
                </Link>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200/50 mt-4">
                  <div className="flex flex-col space-y-2">
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={closeMobileMenu}>
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

        {/* Hero Section */}
        <section className="py-responsive text-center relative overflow-hidden rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 my-4 sm:my-8">
          <div className="absolute inset-0">
            <img
              src="/images/1.jpeg"
              alt="KM Media Training Institute"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-brand-overlay"></div>
          </div>
          <div className="relative z-10 text-white px-responsive">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg">
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full mr-2 sm:mr-3 animate-pulse shadow-lg shadow-purple-400/50"></span>
              New Cohort Starting Soon
            </div>
            <h2 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-5xl font-bold text-white mb-6 sm:mb-8 leading-tight drop-shadow-2xl">
              Learn Media & Tech Skills with
              <br />
              <span className="text-purple-300">Industry Experts</span>
            </h2>
            <p className="text-responsive-lg sm:text-responsive-xl text-white mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-medium">
              Join our hybrid training program combining online learning with
              hands-on offline sessions. Get certified in media production,
              journalism, and digital marketing with personalized mentorship.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="btn-touch-friendly px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  🚀 Get Started Today
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-touch-friendly px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all duration-200"
                >
                  👋 Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-responsive-3 gap-4 sm:gap-6 lg:gap-8 max-w-2xl mx-auto">
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-100 font-medium">
                  Students Trained
                </div>
              </div>
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">
                  95%
                </div>
                <div className="text-xs sm:text-sm text-gray-100 font-medium">
                  Job Placement Rate
                </div>
              </div>
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">
                  50+
                </div>
                <div className="text-xs sm:text-sm text-gray-100 font-medium">
                  Industry Partners
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Features Section */}
        <section className="py-responsive">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-responsive">
            <h3 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose Our Training Program?
            </h3>
            <p className="text-responsive-lg sm:text-responsive-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience world-class media education with cutting-edge
              curriculum and industry connections
            </p>
          </div>
          <div className="grid grid-responsive-3 gap-6 sm:gap-8 px-responsive">
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900">
                  Hybrid Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Learn at your own pace online and attend practical sessions
                  with industry professionals for hands-on experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl">👨‍🏫</span>
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900">
                  Expert Instructors
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Our instructors are industry veterans with years of experience
                  in media production, journalism, and digital marketing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200/50 bg-white/80 backdrop-blur-sm hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl sm:text-2xl">💳</span>
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-900">
                  Flexible Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Choose from flexible payment plans including installment
                  options to fit your budget and make education accessible.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-primary mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Discover our most popular courses designed by industry experts to
              advance your media career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : memoizedCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <p className="text-brand-text-secondary font-medium text-lg">
                  No courses available
                </p>
                <p className="text-sm text-brand-text-muted">
                  Check back soon for new courses!
                </p>
              </div>
            ) : (
              memoizedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-2xl transition-all duration-500 border border-gray-200/50 bg-white/90 backdrop-blur-sm hover:scale-[1.03] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-32 opacity-10">
                    <img
                      src="/images/3.jpeg"
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {course._count.enrollments > 10 && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <span className="bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        🔥 Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">📚</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-sm font-medium text-brand-text-secondary">
                          4.8
                        </span>
                        <span className="text-xs text-brand-text-muted">
                          ({course._count.enrollments})
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-brand-text-primary group-hover:text-brand-primary transition-colors mb-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-brand-text-secondary line-clamp-2 mb-3">
                      {course.description}
                    </CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-brand-text-muted">
                      <span className="flex items-center space-x-1">
                        <span>👨‍🏫</span>
                        <span>{course.instructor.name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{course.duration} weeks</span>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {course.category}
                      </span>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                        {course.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                        {course.mode.join(", ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-brand-text-primary">
                          ₵{course.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-brand-text-muted">
                          App. Fee: ₵{course.applicationFee.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-brand-text-muted">
                          {course._count.applications} applications
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/courses/${course.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full py-3 rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                        >
                          📖 View Details
                        </Button>
                      </Link>
                      <Link
                        href={`/courses/${course.id}/apply`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                          🚀 Apply Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200"
              >
                📚 View All Courses
              </Button>
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 bg-gradient-to-br from-brand-neutral-50 to-brand-neutral-100 rounded-2xl shadow-lg mx-2 mb-6">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-brand-primary mb-4">
                How It Works
              </h3>
              <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                Simple steps to start your media career journey with us
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">📝</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-brand-text-primary mb-3">
                  Apply
                </h4>
                <p className="text-brand-text-secondary leading-relaxed">
                  Pay application fee and submit your application form with
                  required documents
                </p>
              </div>
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">✅</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-brand-text-primary mb-3">
                  Get Approved
                </h4>
                <p className="text-brand-text-secondary leading-relaxed">
                  Admin reviews and approves your application based on
                  requirements
                </p>
              </div>
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">💳</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-brand-text-primary mb-3">
                  Pay Tuition
                </h4>
                <p className="text-brand-text-secondary leading-relaxed">
                  Pay tuition fees in full or choose flexible installment plans
                </p>
              </div>
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    4
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">🚀</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-brand-text-primary mb-3">
                  Start Learning
                </h4>
                <p className="text-brand-text-secondary leading-relaxed">
                  Access courses and begin your training journey with expert
                  guidance
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey Today
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 py-8 bg-gradient-to-r from-brand-neutral-800 to-brand-neutral-900 text-white rounded-t-2xl mx-2">
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
                <h3 className="text-2xl font-bold text-brand-accent">
                  KM Media Training Institute
                </h3>
                <p className="text-brand-neutral-400 text-sm">
                  Excellence in Media Education
                </p>
              </div>
            </div>
            <p className="text-brand-neutral-300 mb-8 max-w-2xl mx-auto">
              Empowering the next generation of media professionals through
              innovative hybrid learning experiences.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <a
                href="#"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-brand-neutral-400 hover:text-brand-primary-light transition-colors"
              >
                Contact Us
              </a>
            </div>
            <div className="pt-6 border-t border-brand-neutral-700">
              <p className="text-brand-neutral-400">
                &copy; 2025 KM Media Training Institute. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
