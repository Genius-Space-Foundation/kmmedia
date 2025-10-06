"use client";

import { useState, useEffect } from "react";
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const categories = [
    "All",
    "Film & Television",
    "Animation & VFX",
    "Photography",
    "Marketing",
    "Production",
    "Journalism",
    "Design",
    "Audio",
  ];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];
  const modes = ["All", "Online", "Offline", "Hybrid"];

  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || course.difficulty === selectedLevel;
    const matchesMode =
      selectedMode === "All" || course.mode.includes(selectedMode);

    return matchesSearch && matchesCategory && matchesLevel && matchesMode;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral-50 via-brand-neutral-100 to-brand-neutral-200 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-tertiary/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative max-w-8xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-surface/95 border-b border-brand-border/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-responsive">
            <nav className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo Section - Left */}
              <Link
                href="/"
                className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shadow-md">
                  <img
                    src="/images/logo.jpeg"
                    alt="KM Media Training Institute Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-brand-primary leading-tight">
                    KM Media Training Institute
                  </h1>
                  <p className="text-xs text-brand-text-muted font-medium">
                    Excellence in Media Education
                  </p>
                </div>
              </Link>

              {/* Navigation Links - Center */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    About
                  </Button>
                </Link>
                <Link href="/stories">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all duration-300 px-4 py-2 text-sm font-medium"
                  >
                    Stories
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="ghost"
                    className="hover:bg-brand-accent/10 hover:text-brand-accent transition-all duration-300 px-4 py-2 text-sm font-medium"
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
                    className="btn-touch-friendly-sm hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:block">
                  <Button className="btn-brand-primary shadow-md btn-touch-friendly-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
                    Sign Up
                  </Button>
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden btn-touch-friendly-sm hover:bg-brand-primary/10 p-2 ml-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            <div className="mt-4 pb-4 border-t border-brand-border/30">
              <div className="flex flex-col space-y-2 pt-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300"
                  >
                    Home
                  </Button>
                </Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-300"
                  >
                    About
                  </Button>
                </Link>
                <Link
                  href="/stories"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all duration-300"
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
                    className="w-full justify-start hover:bg-brand-accent/10 hover:text-brand-accent transition-all duration-300"
                  >
                    Contact
                  </Button>
                </Link>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-brand-border/30 mt-4">
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start border-brand-primary/20 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-start btn-brand-primary hover:opacity-90 transition-all duration-300">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Modern Hero Section */}
        <section className="py-responsive text-center px-responsive">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-responsive-4xl sm:text-responsive-5xl lg:text-responsive-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 sm:mb-8 leading-tight">
              Our Courses
            </h1>
            <p className="text-responsive-lg sm:text-responsive-xl lg:text-responsive-2xl text-brand-text-secondary mb-8 sm:mb-12 leading-relaxed max-w-4xl mx-auto">
              Discover comprehensive media training programs designed by
              industry experts to advance your career in the dynamic world of
              media and communications.
            </p>
          </div>
        </section>

        {/* Modern Search and Filters */}
        <section className="py-responsive px-responsive">
          <div className="max-w-6xl mx-auto">
            <Card className="card-brand-modern border-brand-border/20 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-responsive-xl sm:text-responsive-2xl text-brand-text-primary mb-2 sm:mb-4">
                  Find Your Perfect Course
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-brand h-10 sm:h-12 px-4 bg-brand-surface/5 border-brand-border/20 text-brand-text-primary placeholder-brand-text-muted/60 focus:bg-brand-surface/10 focus:border-brand-primary/50 text-sm sm:text-base"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-brand-text-muted/60 text-sm sm:text-base">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-responsive-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-brand-text-primary text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-brand-surface/5 border border-brand-border/20 text-brand-text-primary rounded-lg focus:bg-brand-surface/10 focus:border-brand-primary/50 text-sm sm:text-base"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-brand-text-primary text-xs sm:text-sm font-medium mb-2">
                      Level
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-brand-surface/5 border border-brand-border/20 text-brand-text-primary rounded-lg focus:bg-brand-surface/10 focus:border-brand-primary/50 text-sm sm:text-base"
                    >
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-brand-text-primary text-xs sm:text-sm font-medium mb-2">
                      Mode
                    </label>
                    <select
                      value={selectedMode}
                      onChange={(e) => setSelectedMode(e.target.value)}
                      className="w-full h-10 sm:h-11 px-3 sm:px-4 bg-brand-surface/5 border border-brand-border/20 text-brand-text-primary rounded-lg focus:bg-brand-surface/10 focus:border-brand-primary/50 text-sm sm:text-base"
                    >
                      {modes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-responsive px-responsive">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="grid grid-responsive-3 gap-6 sm:gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
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
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl sm:text-3xl">📚</span>
                </div>
                <p className="text-brand-text-secondary font-medium text-base sm:text-lg">
                  No courses found
                </p>
                <p className="text-xs sm:text-sm text-brand-text-muted">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-responsive-3 gap-6 sm:gap-8">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="group hover:shadow-2xl transition-all duration-500 border-0 card-brand-modern hover:scale-[1.03] relative overflow-hidden"
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
                        <span className="bg-brand-gradient-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          🔥 Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                            className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                          >
                            View Details
                          </Button>
                        </Link>
                        <Link
                          href={`/courses/${course.id}/apply`}
                          className="flex-1"
                        >
                          <Button className="w-full btn-brand-primary font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                            🚀 Apply Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-brand-gradient-hero mb-6">
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
                  className="btn-brand-primary px-8 py-4 text-lg"
                >
                  Get Started Today
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-brand-border">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-brand-text-secondary">
              © 2024 KM Media Training Institute. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
