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
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <img
          src="/images/1.jpeg"
          alt="KM Media Training Institute"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        {/* Subtle animated elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Professional Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-brand-accent rounded-full mr-3 animate-pulse"></span>
          {user
            ? `Welcome back, ${user.name.split(" ")[0]}!`
            : "Ghana's Premier Media Training Institute"}
          <span className="ml-3 px-3 py-1 bg-brand-accent/90 rounded-full text-xs font-bold text-black">
            {animatedStats.activeStudents}+ Students
          </span>
        </div>

        {/* Main Heading - Clean and Professional */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
          <span className="block">Transform Your Future with</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary block mt-2">
            Expert Media Training
          </span>
        </h1>

        {/* Professional Description */}
        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-up">
          Join{" "}
          <span className="font-semibold text-brand-accent">
            {animatedStats.activeStudents}+
          </span>{" "}
          professionals who've advanced their careers through our
          industry-leading programs
        </p>

        {/* Clean CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-scale-in">
          <Button
            asChild
            size="lg"
            className="btn-brand-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <Link href={user ? "/dashboards" : "/courses"}>
              {user ? "Go to Dashboard" : "Explore Courses"}
            </Link>
          </Button>

          {!user && (
            <Button
              asChild
              size="lg"
              className="bg-transparent border-2 border-white/30 hover:border-white/50 text-white text-lg px-8 py-4 rounded-full hover:scale-105 transition-all duration-300 hover:bg-white/10"
            >
              <Link href="/auth/register">Start Free Trial</Link>
            </Button>
          )}
        </div>

        {/* Professional Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {animatedStats.activeStudents}+
            </div>
            <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
              Active Students
            </div>
          </div>

          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {animatedStats.totalCourses}+
            </div>
            <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
              Expert Courses
            </div>
          </div>

          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {animatedStats.successRate}%
            </div>
            <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
              Success Rate
            </div>
          </div>

          <div
            className="text-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {animatedStats.instructors}+
            </div>
            <div className="text-white/70 text-sm font-medium uppercase tracking-wide">
              Expert Instructors
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/60 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-brand-accent">✓</span>
            <span>Industry Certified</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-brand-accent">✓</span>
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-brand-accent">✓</span>
            <span>Job Placement</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-brand-accent">✓</span>
            <span>Lifetime Access</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex justify-center animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
