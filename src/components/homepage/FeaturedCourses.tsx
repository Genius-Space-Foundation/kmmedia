"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { SkeletonCourseCard } from "@/components/ui/skeleton";
import CourseCard from "@/components/courses/CourseCard";
import { formatCurrency } from "@/lib/currency";

// Use any for simplicity in the preview, as CourseCard has a very specific Course interface
// But we want to ensure we have the minimum required fields
interface CoursePreview extends any {}

export default function FeaturedCourses() {
  const [featuredCourses, setFeaturedCourses] = useState<CoursePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await fetch(
          "/api/courses?featured=true&limit=6&status=PUBLISHED"
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFeaturedCourses(data.data.courses);
          }
        }
      } catch (error) {
        console.error("Error fetching featured courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-neutral-50" aria-busy="true" aria-label="Loading featured courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="h-8 bg-neutral-200 rounded-full w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-10 bg-neutral-200 rounded w-80 mx-auto mb-3 animate-pulse"></div>
            <div className="h-6 bg-neutral-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCourseCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-50" id="featured-courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Featured Courses
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover our most popular courses designed by industry experts.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.slice(0, 6).map((course) => (
            <CourseCard
              key={course.id}
              course={course as any}
            />
          ))}
        </div>

        {/* View All Courses CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-primary text-white hover:bg-brand-secondary px-8 py-3 rounded-md font-medium shadow-sm transition-all"
          >
            <Link href="/courses">
              View All Courses
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
