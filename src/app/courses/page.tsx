"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import Footer from "@/components/layout/Footer";
import CourseFilters, {
  CourseFilter,
} from "@/components/courses/CourseFilters";
import CourseCard from "@/components/courses/CourseCard";
import CourseComparison from "@/components/courses/CourseComparison";
import CourseWishlist from "@/components/courses/CourseWishlist";

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
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function CoursesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CourseFilter>({
    search: "",
    categories: [],
    difficulties: [],
    modes: [],
    priceRange: [0, 10000],
    durationRange: [1, 52],
    rating: 0,
    sortBy: "title",
    sortOrder: "asc",
  });
  const [comparisonCourses, setComparisonCourses] = useState<Course[]>([]);
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);

  // Check for authenticated user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") {
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses?status=PUBLISHED");
        const data = await response.json();
        if (data.success) {
          setCourses(data.data.courses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Enhanced filtering logic
  const filteredCourses = (courses || [])
    .filter((course) => {
      // Search filter
      const matchesSearch =
        !filters.search ||
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        course.instructor.name
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(course.category);

      // Difficulty filter
      const matchesDifficulty =
        filters.difficulties.length === 0 ||
        filters.difficulties.includes(course.difficulty);

      // Mode filter
      const matchesMode =
        filters.modes.length === 0 ||
        filters.modes.some((mode) => course.mode.includes(mode));

      // Price range filter
      const matchesPrice =
        course.price >= filters.priceRange[0] &&
        course.price <= filters.priceRange[1];

      // Duration range filter
      const matchesDuration =
        course.duration >= filters.durationRange[0] &&
        course.duration <= filters.durationRange[1];

      // Rating filter
      const courseRating = course.averageRating || 4.8;
      const matchesRating =
        filters.rating === 0 || courseRating >= filters.rating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesMode &&
        matchesPrice &&
        matchesDuration &&
        matchesRating
      );
    })
    .sort((a, b) => {
      // Sorting logic
      let comparison = 0;

      switch (filters.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "rating":
          const ratingA = a.averageRating || 4.8;
          const ratingB = b.averageRating || 4.8;
          comparison = ratingA - ratingB;
          break;
        case "enrollments":
          comparison = a._count.enrollments - b._count.enrollments;
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

  // Wishlist and comparison handlers
  const handleWishlistToggle = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    if (course.isWishlisted) {
      // Remove from wishlist
      setWishlistCourses((prev) => prev.filter((c) => c.id !== courseId));
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isWishlisted: false } : c))
      );
    } else {
      // Add to wishlist
      const updatedCourse = {
        ...course,
        isWishlisted: true,
        addedToWishlistAt: new Date().toISOString(),
      };
      setWishlistCourses((prev) => [...prev, updatedCourse]);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? updatedCourse : c))
      );
    }
  };

  const handleComparisonToggle = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    if (comparisonCourses.find((c) => c.id === courseId)) {
      setComparisonCourses((prev) => prev.filter((c) => c.id !== courseId));
    } else if (comparisonCourses.length < 4) {
      setComparisonCourses((prev) => [...prev, course]);
    }
  };

  const handleShareCourse = (course: Course) => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: `${window.location.origin}/courses/${course.id}`,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/courses/${course.id}`
      );
      // You could show a toast notification here
    }
  };

  const handlePreviewCourse = (course: Course) => {
    // Open course preview modal or navigate to preview page
    window.open(`/courses/${course.id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-brand-neutral-50 relative overflow-hidden">

      <div className="relative max-w-full mx-auto">
        {/* Enhanced Navigation */}
        <EnhancedNavigation user={user} />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-20">
          {/* Professional Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-neutral-900/70 z-10"></div>
            <img
              src="/images/3.jpeg"
              alt="KM Media Training Institute Courses"
              className="w-full h-full object-cover opacity-10"
            />
          </div>

          <div className="relative z-10 text-center text-white px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto">
            {/* Professional Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-brand-accent rounded-full mr-3 animate-pulse"></span>
              Professional Courses Available
              <span className="ml-3 px-3 py-1 bg-brand-accent/90 rounded-full text-xs font-bold text-black">
                {courses.length}+ Courses
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block">Discover Your Perfect</span>
              <span className="text-brand-primary block mt-2">
                Learning Path
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Choose from our comprehensive range of professional courses
              designed to help you advance your career and acquire new skills.
            </p>

            {/* Functional Search Bar */}
            {/* <div className="max-w-2xl mx-auto mb-12">
            {/* Dynamic Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {courses.length}
                </div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
                  Available Courses
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {new Set(courses.map((c) => c.category)).size}
                </div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
                  Categories
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {courses.reduce(
                    (sum, course) => sum + course._count.enrollments,
                    0
                  )}
                </div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
                  Students Enrolled
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  95%
                </div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Filters */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>}>
              <CourseFilters
                filters={filters}
                onFiltersChange={setFilters}
                totalCourses={courses.length}
                filteredCount={filteredCourses.length}
                isLoading={loading}
              />
            </Suspense>
          </div>
        </section>

        {/* Course Actions Bar */}
        <section className="py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CourseWishlist
                  courses={wishlistCourses}
                  onRemoveFromWishlist={handleWishlistToggle}
                  onClearWishlist={() => {
                    setWishlistCourses([]);
                    setCourses((prev) =>
                      prev.map((c) => ({ ...c, isWishlisted: false }))
                    );
                  }}
                />
                {comparisonCourses.length > 0 && (
                  <CourseComparison
                    courses={comparisonCourses}
                    onRemoveCourse={(courseId) =>
                      setComparisonCourses((prev) =>
                        prev.filter((c) => c.id !== courseId)
                      )
                    }
                    onClearAll={() => setComparisonCourses([])}
                  />
                )}
              </div>
              <div className="text-sm text-gray-600">
                {loading
                  ? "Loading..."
                  : `${filteredCourses.length} of ${courses.length} courses`}
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
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
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find more
                  courses.
                </p>
                <Button
                  onClick={() =>
                    setFilters({
                      search: "",
                      categories: [],
                      difficulties: [],
                      modes: [],
                      priceRange: [0, 10000],
                      durationRange: [1, 52],
                      rating: 0,
                      sortBy: "title",
                      sortOrder: "asc",
                    })
                  }
                  className="btn-brand-secondary rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="default"
                    onWishlistToggle={handleWishlistToggle}
                    onShare={handleShareCourse}
                    onPreview={handlePreviewCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-neutral-900 mb-6">
              Ready to Start Your Media Career?
            </h2>
            <p className="text-xl text-brand-text-secondary mb-8">
              Join thousands of students who have transformed their careers with
              our comprehensive media training programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="btn-brand-primary px-8 py-4 text-lg rounded-xl"
                >
                  Get Started Today
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 rounded-xl"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
