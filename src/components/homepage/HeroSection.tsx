"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HeroSection() {
  const [user, setUser] = useState<User | null>(null);

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
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/1.jpeg')" }}
      >
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-neutral-900/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Main Heading */}
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Elevate Your</span>
            <span className="block text-brand-primary mt-2">
              Media & Tech Career
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-neutral-200 leading-relaxed max-w-2xl">
            Master the skills that define the future of media and technology. Access world-class training in film production, digital broadcasting, and tech innovation to accelerate your professional journey.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href={user ? `/dashboards/${user.role.toLowerCase()}` : "/auth/register"}>
              <Button className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-secondary shadow-lg hover:shadow-xl transition-all duration-300">
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-semibold rounded-lg text-white bg-white/10 border-2 border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                View Courses
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-neutral-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-primary" />
              <span className="font-medium">Industry Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-primary" />
              <span className="font-medium">Expert Instructors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-primary" />
              <span className="font-medium">Job Placement Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade (optional, for smooth transition to next section) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
