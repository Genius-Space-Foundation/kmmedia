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
import { useSession } from "next-auth/react";
import CourseFilters, {
  CourseFilter,
} from "@/components/courses/CourseFilters";
import CourseCard from "@/components/courses/CourseCard";
import CourseComparison from "@/components/courses/CourseComparison";
import CourseWishlist from "@/components/courses/CourseWishlist";
import CourseQuickPreviewModal from "@/components/course/CourseQuickPreviewModal";

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
  const { data: session } = useSession();
  const user = session?.user;
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
    userId: user?.id,
  });
  const [comparisonCourses, setComparisonCourses] = useState<Course[]>([]);
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    setSelectedCourse(course);
    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-neutral-50 flex flex-col">
      {/* Enhanced Navigation */}
      <EnhancedNavigation user={user} />

      <main className="flex-grow">
        {/* Premium Courses Hero Section */}
        <section className="relative min-h-[650px] lg:min-h-[850px] flex items-center justify-center overflow-hidden py-24 bg-neutral-950">
          {/* Advanced Background Layers */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/3.jpeg"
              alt="KM Media Training Institute Courses"
              className="w-full h-full object-cover grayscale opacity-20 scale-105"
            />
            {/* Dark sophisticated mask */}
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-[1px]"></div>
            {/* Mesh gradient accents */}
            <div 
              className="absolute inset-0 opacity-30 mix-blend-screen"
              style={{ 
                backgroundImage: `radial-gradient(circle at 10% 20%, var(--brand-primary) 0%, transparent 40%),
                                  radial-gradient(circle at 90% 80%, #064E6B 0%, transparent 40%)`
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]"></div>
          </div>

          <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {/* Discovery Badge - Glassmorphic */}
            <div className="inline-flex items-center px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] mb-12 shadow-2xl">
              <span className="mr-3 animate-pulse">✨</span>
              Curated Professional Pathways
            </div>

            {/* Main Heading with Master Typography */}
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-white mb-10 leading-[0.85] tracking-tight">
              Master the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-[#57D2FF] to-brand-primary bg-[length:200%_auto] animate-gradient-x py-3">
                Modern Media
              </span>
            </h1>

            {/* Professional Subtitle */}
            <p className="text-lg sm:text-2xl text-neutral-400 mb-20 max-w-4xl mx-auto leading-relaxed font-medium">
              Elevate your career with industry-leading certifications and expert-led training in film, broadcasting, and technology innovation.
            </p>

            {/* High-Fidelity Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-6xl mx-auto">
              {[
                { label: "Expert Courses", value: `${courses.length}+`, color: "from-brand-primary to-cyan-400" },
                { label: "Specializations", value: `${new Set(courses.map((c) => c.category)).size}`, color: "from-blue-500 to-indigo-400" },
                { label: "Active Students", value: `${courses.reduce((sum, course) => sum + course._count.enrollments, 0)}`, color: "from-sky-500 to-blue-300" },
                { label: "Success Rate", value: "95%", color: "from-emerald-500 to-teal-300" }
              ].map((stat, idx) => (
                <div key={idx} className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className="relative h-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl transition-all duration-300 group-hover:bg-white/[0.07] group-hover:-translate-y-1">
                    <div className={`text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br ${stat.color} mb-2 tracking-tighter`}>
                      {stat.value}
                    </div>
                    <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary to-transparent"></div>
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

        {/* Course Quick Preview Modal */}
        <CourseQuickPreviewModal
          course={selectedCourse}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedCourse(null);
          }}
        />

        </main>

        {/* Footer */}
        <Footer />
    </div>
  );
}
