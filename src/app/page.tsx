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
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedCourses from "@/components/homepage/FeaturedCourses";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Enhanced Navigation */}
      <EnhancedNavigation user={user} />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        {/* Enhanced Hero Section */}
        <HeroSection />

        {/* Featured Courses Section */}
        <FeaturedCourses />

        {/* Why Choose Us Section */}
        <section className="py-20 bg-brand-surface relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-brand-secondary/5 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-responsive relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center px-6 py-3 bg-brand-primary-light border border-brand-primary rounded-full text-brand-primary text-sm font-medium mb-8 shadow-brand-sm">
                <span className="text-lg mr-2">✨</span>
                Why Choose Us
              </div>
              <h2 className="text-responsive-3xl font-bold text-brand-text-primary mb-6 leading-tight">
                Why Choose KM Media Training Institute?
              </h2>
              <p className="text-responsive-lg text-brand-text-secondary max-w-4xl mx-auto leading-relaxed">
                We provide cutting-edge courses with industry experts, modern
                facilities, and comprehensive support to help you succeed in
                your media career journey.
              </p>
            </div>

            {/* Grid Layout: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 cards-grid">
              {/* Expert Instructors */}
              <Card className="card-brand-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 icon-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 primary-glow group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-brand-text-primary mb-2">
                    Expert Instructors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-secondary leading-relaxed">
                    Learn from industry professionals with 10+ years of
                    experience and proven track records in their fields.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Flexible Learning */}
              <Card className="card-brand-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 icon-brand-secondary rounded-full flex items-center justify-center mx-auto mb-4 secondary-glow group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-brand-text-primary mb-2">
                    Flexible Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-secondary leading-relaxed">
                    Study at your own pace with 24/7 access to course materials,
                    recorded sessions, and online resources.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Industry Certificates */}
              <Card className="card-brand-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 icon-brand-accent rounded-full flex items-center justify-center mx-auto mb-4 accent-glow group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-brand-text-primary mb-2">
                    Industry Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-secondary leading-relaxed">
                    Earn recognized certificates that are valued by top
                    employers and boost your professional credentials.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Hands-on Projects */}
              <Card className="card-brand-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 icon-brand-tertiary rounded-full flex items-center justify-center mx-auto mb-4 tertiary-glow group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-brand-text-primary mb-2">
                    Hands-on Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-secondary leading-relaxed">
                    Build real-world projects and create an impressive portfolio
                    that showcases your skills to employers.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Career Support */}
              <Card className="card-brand-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 icon-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 primary-glow group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-brand-text-primary mb-2">
                    Career Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-secondary leading-relaxed">
                    Get lifetime access to career services, job placement
                    assistance, and our extensive alumni network.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Modern Equipment */}
              <Card className="card-brand-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 icon-brand-secondary rounded-full flex items-center justify-center mx-auto mb-4 secondary-glow group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💻</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-brand-text-primary mb-2">
                    Modern Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-secondary leading-relaxed">
                    Access state-of-the-art equipment and software used by
                    leading media companies and production houses.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-brand-neutral-50">
          <div className="max-w-7xl mx-auto px-responsive">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 icon-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 primary-glow">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-responsive-3xl font-bold mb-2 text-brand-text-primary">
                  500+
                </div>
                <div className="text-brand-text-secondary">Active Students</div>
              </div>
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 icon-brand-secondary rounded-full flex items-center justify-center mx-auto mb-4 secondary-glow">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="text-responsive-3xl font-bold mb-2 text-brand-text-primary">
                  50+
                </div>
                <div className="text-brand-text-secondary">Expert Courses</div>
              </div>
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 icon-brand-accent rounded-full flex items-center justify-center mx-auto mb-4 accent-glow">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-responsive-3xl font-bold mb-2 text-brand-text-primary">
                  95%
                </div>
                <div className="text-brand-text-secondary">Success Rate</div>
              </div>
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 icon-brand-tertiary rounded-full flex items-center justify-center mx-auto mb-4 tertiary-glow">
                  <span className="text-2xl">🕒</span>
                </div>
                <div className="text-responsive-3xl font-bold mb-2 text-brand-text-primary">
                  24/7
                </div>
                <div className="text-brand-text-secondary">
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-brand-surface">
          <div className="max-w-4xl mx-auto text-center px-responsive">
            <h2 className="text-responsive-3xl font-bold text-brand-text-primary mb-6">
              Ready to Start Your Media Career?
            </h2>
            <p className="text-responsive-lg text-brand-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of students who have transformed their careers with
              our comprehensive media training programs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="btn-brand-primary text-lg">
                <Link href="/auth/register">Get Started Today</Link>
              </Button>
              <Button asChild size="lg" className="btn-brand-outline text-lg">
                <Link href="/courses">View Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-brand-neutral-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-responsive">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">KM</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      KM Media Training Institute
                    </h3>
                    <p className="text-brand-neutral-400 text-sm">
                      Excellence in Media Education
                    </p>
                  </div>
                </div>
                <p className="text-brand-neutral-400 mb-6 max-w-md">
                  Empowering the next generation of media professionals through
                  innovative hybrid learning experiences.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-brand-neutral-400 hover:text-brand-primary transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-brand-neutral-400 hover:text-brand-secondary transition-colors"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-brand-neutral-400 hover:text-brand-accent transition-colors"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-brand-neutral-400 hover:text-brand-primary transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/courses"
                      className="text-brand-neutral-400 hover:text-brand-primary transition-colors"
                    >
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/stories"
                      className="text-brand-neutral-400 hover:text-brand-primary transition-colors"
                    >
                      Success Stories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-brand-neutral-400 hover:text-brand-primary transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                <ul className="space-y-2 text-brand-neutral-400">
                  <li>📧 info@kmmedia.com</li>
                  <li>📞 +233 123 456 789</li>
                  <li>📍 Accra, Ghana</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-brand-neutral-800 mt-12 pt-8 text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-brand-neutral-400">
                  © 2024 KM Media Training Institute. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link
                    href="/privacy"
                    className="text-brand-neutral-400 hover:text-brand-primary transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-brand-neutral-400 hover:text-brand-primary transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
