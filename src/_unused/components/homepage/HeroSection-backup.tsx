"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroStats {
  activeStudents: number;
  totalCourses: number;
  successRate: number;
  instructors: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HeroSection() {
  const [stats, setStats] = useState<HeroStats>({
    activeStudents: 500,
    totalCourses: 50,
    successRate: 95,
    instructors: 15,
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState<HeroStats>({
    activeStudents: 0,
    totalCourses: 0,
    successRate: 0,
    instructors: 0,
  });

  // Check for authenticated user for personalization
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

  // Fetch real-time statistics with enhanced error handling
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/homepage/stats");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default stats on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animate statistics counter
  useEffect(() => {
    if (!isLoading) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          activeStudents: Math.floor(stats.activeStudents * progress),
          totalCourses: Math.floor(stats.totalCourses * progress),
          successRate: Math.floor(stats.successRate * progress),
          instructors: Math.floor(stats.instructors * progress),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedStats(stats);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [stats, isLoading]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900"></div>
        
        {/* Optional background image with better opacity */}
        <img
          src="/images/1.jpeg"
          alt="KM Media Training Institute"
          className="w-full h-full object-cover opacity-5"
          loading="eager"
        />
        
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>

        {/* Modern animated elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl motion-safe:animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl motion-safe:animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl motion-safe:animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 sm:py-20">
        {/* Modern Status Badge */}
        <div 
          className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white text-sm font-medium mb-8 shadow-2xl motion-safe:animate-fade-in-up hover:bg-white/15 transition-all duration-300"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-3 w-3">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-semibold">
            {user
              ? `Welcome back, ${user.name.split(" ")[0]}!`
              : "Ghana's #1 Media Training Institute"}
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-xs font-bold text-gray-900 shadow-lg">
            {animatedStats.activeStudents}+ Students
          </span>
        </div>

        {/* Enhanced Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[1.1] motion-safe:animate-fade-in-up">
          <span className="block mb-3">Transform Your Career</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-blue-400 to-purple-400 animate-gradient-shift">
            Master Media Production
          </span>
        </h1>

        {/* Enhanced Description */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed motion-safe:animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
          Join{" "}
          <span className="font-bold text-yellow-300">
            {animatedStats.activeStudents}+
          </span>{" "}
          professionals who've launched successful media careers through our
          industry-certified programs
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 motion-safe:animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <Button
            asChild
            size="lg"
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base sm:text-lg font-semibold px-10 py-7 rounded-full shadow-2xl hover:shadow-blue-500/50 motion-safe:hover:scale-105 transition-all duration-300 border-0"
            aria-label={user ? "Go to your dashboard" : "Explore available courses"}
          >
            <Link href={user ? "/dashboards" : "/courses"} className="flex items-center justify-center gap-2">
              {user ? "Go to Dashboard" : "Explore Courses"}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>

          {!user && (
            <Button
              asChild
              size="lg"
              className="group bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-white text-base sm:text-lg font-semibold px-10 py-7 rounded-full motion-safe:hover:scale-105 transition-all duration-300 shadow-xl"
              aria-label="Start your free trial"
            >
              <Link href="/auth/register" className="flex items-center justify-center gap-2">
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          )}
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto" role="region" aria-label="Institute statistics">
          <div
            className="text-center motion-safe:animate-fade-in-up p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform" aria-label={`${animatedStats.activeStudents} plus active students`}>
              {animatedStats.activeStudents}
              <span className="text-yellow-400">+</span>
            </div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold uppercase tracking-widest">
              Active Students
            </div>
          </div>

          <div
            className="text-center motion-safe:animate-fade-in-up p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform" aria-label={`${animatedStats.totalCourses} plus expert courses`}>
              {animatedStats.totalCourses}
              <span className="text-blue-400">+</span>
            </div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold uppercase tracking-widest">
              Expert Courses
            </div>
          </div>

          <div
            className="text-center motion-safe:animate-fade-in-up p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform" aria-label={`${animatedStats.successRate} percent success rate`}>
              {animatedStats.successRate}
              <span className="text-green-400">%</span>
            </div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold uppercase tracking-widest">
              Success Rate
            </div>
          </div>

          <div
            className="text-center motion-safe:animate-fade-in-up p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform" aria-label={`${animatedStats.instructors} plus expert instructors`}>
              {animatedStats.instructors}
              <span className="text-purple-400">+</span>
            </div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold uppercase tracking-widest">
              Expert Instructors
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-14 flex flex-wrap justify-center items-center gap-6 sm:gap-8" role="list" aria-label="Key features" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all" role="listitem">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-white">Industry Certified</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all" role="listitem">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-white">24/7 Support</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all" role="listitem">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-white">Job Placement</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all" role="listitem">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-white">Lifetime Access</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-20 flex justify-center" aria-hidden="true">
          <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center motion-safe:animate-bounce">
            <div className="w-1.5 h-3 bg-white rounded-full mt-2 motion-safe:animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
