"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, ArrowRight, BookOpen } from "lucide-react";

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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-brand-primary-light text-brand-primary rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4 mr-2" />
            Featured Courses
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Start Your Learning Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most popular courses designed by industry experts to
            help you master new skills and advance your career
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.slice(0, 6).map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
            >
              <div className="relative">
                {/* Course Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/80" />
                </div>

                {/* Course Level Badge */}
                {course.level && (
                  <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800 hover:bg-white">
                    {course.level}
                  </Badge>
                )}

                {/* Price Badge */}
                {course.price && (
                  <Badge className="absolute top-4 right-4 bg-brand-primary hover:bg-brand-primary-dark">
                    ${course.price}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-600">
                      {course.rating}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollments} enrolled</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration} weeks</span>
                    </div>
                  )}
                </div>

                {course.instructor && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {course.instructor.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.instructor.name}
                    </span>
                  </div>
                )}

                <Button asChild className="w-full btn-brand-primary group">
                  <Link href={`/courses/${course.id}`}>
                    View Course
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
            className="btn-brand-primary text-lg px-8 py-3"
          >
            <Link href="/courses">
              View All Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
