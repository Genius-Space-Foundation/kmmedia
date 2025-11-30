"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, ArrowRight, BookOpen } from "lucide-react";
import { SkeletonCourseCard } from "@/components/ui/skeleton";

interface CoursePreview {
  id: string;
  title: string;
  category: string;
  enrollments: number;
  rating: number;
  image?: string;
  price?: number;
  duration?: number;
  instructor?: {
    name: string;
    avatar?: string;
  };
  _count?: {
    enrollments: number;
  };
  description?: string;
  level?: string;
}

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
            const courses = data.data.courses.map((course: any) => ({
              ...course,
              enrollments: course._count?.enrollments || 0,
            }));
            setFeaturedCourses(courses);
          }
        }
      } catch (error) {
        console.error("Error fetching featured courses:", error);
        // Set mock data for development
        setFeaturedCourses([
          {
            id: "1",
            title: "Digital Photography Masterclass",
            category: "Photography",
            enrollments: 245,
            rating: 4.8,
            price: 299,
            duration: 8,
            level: "Beginner",
            description:
              "Master the art of digital photography with professional techniques",
            instructor: { name: "Sarah Johnson" },
          },
          {
            id: "2",
            title: "Video Production Essentials",
            category: "Video Production",
            enrollments: 189,
            rating: 4.9,
            price: 399,
            duration: 12,
            level: "Intermediate",
            description:
              "Learn professional video production from concept to final cut",
            instructor: { name: "Michael Chen" },
          },
          {
            id: "3",
            title: "Social Media Marketing",
            category: "Marketing",
            enrollments: 312,
            rating: 4.7,
            price: 199,
            duration: 6,
            level: "Beginner",
            description:
              "Build your brand and grow your audience on social platforms",
            instructor: { name: "Emma Davis" },
          },
        ]);
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
            <Card
              key={course.id}
              className="group hover:shadow-lg transition-all duration-300 border border-neutral-200 bg-white overflow-hidden"
            >
              <div className="relative overflow-hidden h-48 bg-neutral-100 flex items-center justify-center">
                {/* Placeholder for course image */}
                <BookOpen className="w-12 h-12 text-neutral-300" />
                
                {course.level && (
                  <Badge className="absolute top-4 left-4 bg-white text-neutral-900 hover:bg-white shadow-sm font-medium">
                    {course.level}
                  </Badge>
                )}

                {course.price && (
                  <Badge className="absolute top-4 right-4 bg-brand-primary text-white hover:bg-brand-primary shadow-sm font-bold">
                    ${course.price}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                    {course.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-neutral-700">
                      {course.rating}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-neutral-900 line-clamp-2 mb-1">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0 pb-5">
                {course.description && (
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-neutral-500 mb-6 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollments} students</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration} weeks</span>
                    </div>
                  )}
                </div>

                <Button 
                  asChild 
                  className="w-full bg-white text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                >
                  <Link href={`/courses/${course.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
